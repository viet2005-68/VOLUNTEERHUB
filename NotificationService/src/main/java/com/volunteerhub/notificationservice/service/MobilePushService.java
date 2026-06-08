package com.volunteerhub.notificationservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.AndroidNotification;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import com.volunteerhub.common.enums.PushChannel;
import com.volunteerhub.notificationservice.model.DeviceToken;
import com.volunteerhub.notificationservice.repository.DeviceTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class MobilePushService {

    private final DeviceTokenRepository deviceTokenRepository;
    private final ObjectProvider<FirebaseMessaging> firebaseMessagingProvider;
    private final ObjectMapper objectMapper;

    @Value("${push.mobile.android.default-channel-id:volunteerhub_notifications}")
    private String defaultAndroidChannelId;

    @Value("${push.mobile.android.chat-channel-id:volunteerhub_chats}")
    private String chatAndroidChannelId;

    public void pushToUser(String userId, String payloadJson) {
        FirebaseMessaging firebaseMessaging = firebaseMessagingProvider.getIfAvailable();
        if (firebaseMessaging == null) {
            log.info("FCM is disabled. Skipping mobile push for user={}", userId);
            return;
        }

        List<DeviceToken> tokens = deviceTokenRepository.findByUserIdAndChannel(userId, PushChannel.FCM);
        if (tokens.isEmpty()) {
            log.info("No FCM device tokens found for user={}", userId);
            return;
        }

        Map<String, Object> payload = parsePayload(payloadJson);
        log.info("Sending FCM push user={} tokenCount={} type={} contextId={}",
                userId,
                tokens.size(),
                payload.get("type"),
                payload.get("contextId"));
        tokens.forEach(token -> send(firebaseMessaging, userId, token, payload, payloadJson));
    }

    private void send(FirebaseMessaging firebaseMessaging,
                      String userId,
                      DeviceToken token,
                      Map<String, Object> payload,
                      String payloadJson) {
        try {
            String messageId = firebaseMessaging.send(Message.builder()
                    .setToken(token.getToken())
                    .setNotification(com.google.firebase.messaging.Notification.builder()
                            .setTitle(text(payload.get("title"), "VolunteerHub"))
                            .setBody(text(payload.get("body"), "Bạn có thông báo mới"))
                            .build())
                    .setAndroidConfig(AndroidConfig.builder()
                            .setPriority(AndroidConfig.Priority.HIGH)
                            .setNotification(AndroidNotification.builder()
                                    .setChannelId(androidChannelId(payload))
                                    .build())
                            .build())
                    .putAllData(data(payload, payloadJson))
                    .build());
            log.info("FCM push sent user={} tokenId={} messageId={}", userId, token.getId(), messageId);
        } catch (FirebaseMessagingException e) {
            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                deviceTokenRepository.delete(token);
                log.info("Removed unregistered FCM token user={} tokenId={}", userId, token.getId());
                return;
            }
            log.warn("Failed to send FCM push user={} tokenId={} errorCode={}",
                    userId,
                    token.getId(),
                    e.getMessagingErrorCode(),
                    e);
        }
    }

    private Map<String, Object> parsePayload(String payloadJson) {
        try {
            return objectMapper.readValue(payloadJson, new TypeReference<>() {
            });
        } catch (Exception e) {
            log.warn("Failed to parse mobile push payload JSON.", e);
            return Map.of("body", payloadJson);
        }
    }

    private Map<String, String> data(Map<String, Object> payload, String payloadJson) {
        Map<String, String> data = new HashMap<>();
        data.put("payload", payloadJson);
        payload.forEach((key, value) -> {
            if (value != null) {
                data.put(key, Objects.toString(value));
            }
        });
        return data;
    }

    private String androidChannelId(Map<String, Object> payload) {
        return "CHAT_MESSAGE".equals(text(payload.get("type"), ""))
                ? chatAndroidChannelId
                : defaultAndroidChannelId;
    }

    private String text(Object value, String fallback) {
        if (value == null || value.toString().isBlank()) {
            return fallback;
        }
        return value.toString();
    }
}
