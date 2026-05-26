package com.volunteerhub.notificationservice.service;


import com.volunteerhub.notificationservice.model.Subscription;
import com.volunteerhub.notificationservice.repository.SubscriptionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Security;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebPushService {
    private final SubscriptionRepository subscriptionRepository;
    
    @Value("${vapid.public.key}")
    private String publicKey;

    @Value("${vapid.private.key}")
    private String privateKey;

    @Value("${vapid.subject}")
    private String subject;

    private PushService pushService;

    public String getPublicKey() {
        if (publicKey == null || publicKey.isEmpty() || publicKey.equals("YOUR_PUBLIC_KEY_HERE")) {
            log.error("VAPID public key is not configured properly!");
            throw new IllegalStateException("VAPID public key is not configured. Please set VAPID_PUBLIC_KEY environment variable.");
        }
        return publicKey;
    }

    @PostConstruct
    private void init() throws Exception {
        try {
            log.info("Initializing WebPushService...");
            
            // Validate VAPID keys
            if (publicKey == null || publicKey.isEmpty() || publicKey.equals("YOUR_PUBLIC_KEY_HERE")) {
                log.error("VAPID public key is not configured!");
                throw new IllegalStateException("VAPID public key is not configured");
            }
            
            if (privateKey == null || privateKey.isEmpty() || privateKey.equals("YOUR_PRIVATE_KEY_HERE")) {
                log.error("VAPID private key is not configured!");
                throw new IllegalStateException("VAPID private key is not configured");
            }
            
            Security.addProvider(new BouncyCastleProvider());
            pushService = new PushService(publicKey, privateKey, subject);
            
            log.info("WebPushService initialized successfully");
            log.info("VAPID Subject: {}", subject);
            log.info("Public Key (first 20 chars): {}", publicKey.substring(0, Math.min(20, publicKey.length())));
        } catch (Exception e) {
            log.error("Failed to initialize WebPushService", e);
            throw e;
        }
    }

    public void sendNotification(Subscription subscription, String messageJson) {
        try {
            log.debug("Sending notification to endpoint: {}", subscription.getEndpoint());
            
            Notification notification = new Notification(
                    subscription.getEndpoint(),
                    subscription.getKeys().getP256dh(),
                    subscription.getKeys().getAuth(),
                    messageJson.getBytes()
            );
            
            pushService.send(notification);
            log.info("Notification sent successfully to subscription ID: {}", subscription.getId());
        } catch (Exception e) {
            log.error("Failed to send notification to subscription ID: {}. Deleting invalid subscription.", 
                    subscription.getId(), e);
            try {
                subscriptionRepository.delete(subscription);
                log.info("Deleted invalid subscription ID: {}", subscription.getId());
            } catch (Exception deleteEx) {
                log.error("Failed to delete invalid subscription ID: {}", subscription.getId(), deleteEx);
            }
            throw new RuntimeException("Failed to send notification", e);
        }
    }

    public void pushToUser(String userId, String payloadJson) {
        log.info("Pushing notification to user: {}", userId);
        List<Subscription> subs = subscriptionRepository.findByUserId(userId);
        
        if (subs.isEmpty()) {
            log.warn("No subscriptions found for user: {}", userId);
            return;
        }
        
        log.info("Found {} subscription(s) for user: {}", subs.size(), userId);
        int successCount = 0;
        int failCount = 0;
        
        for (Subscription sub : subs) {
            try {
                sendNotification(sub, payloadJson);
                successCount++;
            } catch (Exception e) {
                log.error("Failed to send notification to subscription ID: {}", sub.getId(), e);
                failCount++;
            }
        }
        
        log.info("Push to user {} completed. Success: {}, Failed: {}", userId, successCount, failCount);
    }

}
