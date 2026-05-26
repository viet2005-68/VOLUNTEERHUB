package com.volunteerhub.notificationservice.controller;

import com.volunteerhub.notificationservice.model.Subscription;
import com.volunteerhub.notificationservice.repository.SubscriptionRepository;
import com.volunteerhub.notificationservice.service.WebPushService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/v1/notifications/web-push")
@RequiredArgsConstructor
@Slf4j
public class WebPushController {
    private final WebPushService webPushService;
    private final SubscriptionRepository subscriptionRepository;

    private final List<Subscription> subscriptions = new CopyOnWriteArrayList<>();

    @GetMapping("/public-key")
    public ResponseEntity<String> getPublicKey() {
        try {
            String publicKey = webPushService.getPublicKey();
            log.info("Public key requested successfully");
            return ResponseEntity.ok(publicKey);
        } catch (Exception e) {
            log.error("Error getting public key", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving public key");
        }
    }


    @PostMapping("/subscribe")
    public ResponseEntity<String> subscribe(@RequestBody Subscription subscription) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Unauthorized subscription attempt");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            String currentUserId = authentication.getName();
            log.info("Processing subscription for user: {}", currentUserId);

            // Validate subscription data
            if (subscription.getEndpoint() == null || subscription.getEndpoint().isEmpty()) {
                log.error("Invalid subscription: missing endpoint");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid subscription: missing endpoint");
            }

            if (subscription.getKeys() == null || 
                subscription.getKeys().getP256dh() == null || 
                subscription.getKeys().getAuth() == null) {
                log.error("Invalid subscription: missing keys");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid subscription: missing keys");
            }

            // Check if subscription already exists
            if (subscriptionRepository.findByEndpoint(subscription.getEndpoint()).isPresent()) {
                log.info("Subscription already exists for endpoint: {}", subscription.getEndpoint());
                return ResponseEntity.status(HttpStatus.OK)
                        .body("Subscription already exists");
            }

            subscription.setUserId(currentUserId);
            subscriptionRepository.save(subscription);
            log.info("Subscription saved successfully for user: {}", currentUserId);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Subscription created successfully");
        } catch (Exception e) {
            log.error("Error saving subscription", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving subscription: " + e.getMessage());
        }
    }

    @PostMapping("/broadcast")
    public ResponseEntity<String> broadcast(@RequestBody String message) {
        try {
            log.info("Broadcasting message to all subscribers");
            List<Subscription> allSubs = subscriptionRepository.findAll();
            int successCount = 0;
            int failCount = 0;
            
            for (Subscription sub : allSubs) {
                try {
                    webPushService.sendNotification(sub, message);
                    successCount++;
                } catch (Exception e) {
                    log.error("Failed to send notification to subscription: {}", sub.getId(), e);
                    failCount++;
                }
            }
            
            String result = String.format("Broadcast completed. Success: %d, Failed: %d", 
                    successCount, failCount);
            log.info(result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error during broadcast", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during broadcast: " + e.getMessage());
        }
    }

    @PostMapping("/test-send")
    public ResponseEntity<String> sendTestMessage() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            String userId = authentication.getName();
            log.info("Sending test notification to user: {}", userId);

            var subs = subscriptionRepository.findByUserId(userId);
            
            if (subs.isEmpty()) {
                log.warn("No subscriptions found for user: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No subscriptions found for this user");
            }

            int sentCount = 0;
            for(Subscription sub : subs) {
                try {
                    webPushService.sendNotification(sub, 
                            "{\"title\": \"Test Notification\", \"body\": \"Hello from VolunteerHub Backend!\"}");
                    sentCount++;
                } catch (Exception e) {
                    log.error("Failed to send test notification", e);
                }
            }
            
            String result = String.format("Test notification sent to %d subscription(s)", sentCount);
            log.info(result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error sending test message", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error sending test message: " + e.getMessage());
        }
    }
}
