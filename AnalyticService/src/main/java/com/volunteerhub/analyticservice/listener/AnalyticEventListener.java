package com.volunteerhub.analyticservice.listener;

import com.volunteerhub.analyticservice.config.RabbitMQConfig;
import com.volunteerhub.common.dto.EventResponse;
import com.volunteerhub.common.dto.message.event.*;
import com.volunteerhub.common.dto.message.registration.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Set;

@Component
@RabbitListener(queues = RabbitMQConfig.ANALYTIC_QUEUE)
@RequiredArgsConstructor
@Slf4j
public class AnalyticEventListener {

    private final RedisTemplate<String, Object> analyticsRedisTemplate;
    private final RestClient eventClient;

    private void evictUserKeys(String userId) {
        if (userId != null && !userId.isBlank()) {
            Set<String> keys = analyticsRedisTemplate.keys("analytic:" + userId + ":*");
            if (keys != null && !keys.isEmpty()) {
                analyticsRedisTemplate.delete(keys);
                log.info("Evicted {} cache keys for user {}", keys.size(), userId);
            }
        }
    }

    private void evictGlobalKeys() {
        Set<String> globalKeys = analyticsRedisTemplate.keys("analytic:global:*");
        if (globalKeys != null && !globalKeys.isEmpty()) {
            analyticsRedisTemplate.delete(globalKeys);
            log.info("Evicted {} global analytic cache keys", globalKeys.size());
        }

        Set<String> adminDashboardKeys = analyticsRedisTemplate.keys("analytic:*:dashboard:ADMIN");
        if (adminDashboardKeys != null && !adminDashboardKeys.isEmpty()) {
            analyticsRedisTemplate.delete(adminDashboardKeys);
            log.info("Evicted {} admin dashboard cache keys", adminDashboardKeys.size());
        }
    }

    private String fetchEventOwnerId(Long eventId) {
        try {
            EventResponse event = eventClient.get()
                    .uri("/{eventId}", eventId)
                    .retrieve()
                    .body(EventResponse.class);
            return event != null ? event.getOwnerId() : null;
        } catch (Exception e) {
            log.warn("Failed to fetch event owner for eventId {}: {}", eventId, e.getMessage());
            return null;
        }
    }

    // ==================== EVENT MESSAGES ====================

    @RabbitHandler
    public void handleEventCreated(EventCreatedMessage message) {
        log.info("Received EventCreatedMessage for event id: {}, owner: {}", message.getId(), message.getOwnerId());
        evictUserKeys(message.getOwnerId());
        evictGlobalKeys();
    }

    @RabbitHandler
    public void handleEventUpdated(EventUpdatedMessage message) {
        log.info("Received EventUpdatedMessage for event id: {}, owner: {}", message.getId(), message.getOwnerId());
        evictUserKeys(message.getOwnerId());
        evictGlobalKeys();
    }

    @RabbitHandler
    public void handleEventApproved(EventApprovedMessage message) {
        log.info("Received EventApprovedMessage for event id: {}, owner: {}", message.getEventId(), message.getOwnerId());
        evictUserKeys(message.getOwnerId());
        evictGlobalKeys();
    }

    @RabbitHandler
    public void handleEventRejected(EventRejectedMessage message) {
        log.info("Received EventRejectedMessage for event id: {}, owner: {}", message.getEventId(), message.getOwnerId());
        evictUserKeys(message.getOwnerId());
        evictGlobalKeys();
    }

    @RabbitHandler
    public void handleEventDeleted(EventDeletedMessage message) {
        log.info("Received EventDeletedMessage for event id: {}, owner: {}", message.getEventId(), message.getOwnerId());
        evictUserKeys(message.getOwnerId());
        evictGlobalKeys();
    }

    // ==================== REGISTRATION MESSAGES ====================

    @RabbitHandler
    public void handleRegistrationCreated(RegistrationCreatedMessage message) {
        log.info("Received RegistrationCreatedMessage for volunteer: {}, eventOwner: {}", message.getUserId(), message.getEventOwnerId());
        evictUserKeys(message.getUserId());
        evictUserKeys(message.getEventOwnerId());
        evictGlobalKeys();
    }

    @RabbitHandler
    public void handleRegistrationApproved(RegistrationApprovedMessage message) {
        log.info("Received RegistrationApprovedMessage for volunteer: {}, eventId: {}", message.getUserId(), message.getEventId());
        evictUserKeys(message.getUserId());
        
        String ownerId = fetchEventOwnerId(message.getEventId());
        if (ownerId != null) {
            evictUserKeys(ownerId);
        }
        evictGlobalKeys();
    }

    @RabbitHandler
    public void handleRegistrationRejected(RegistrationRejectedMessage message) {
        log.info("Received RegistrationRejectedMessage for volunteer: {}, eventId: {}", message.getUserId(), message.getEventId());
        evictUserKeys(message.getUserId());
        
        String ownerId = fetchEventOwnerId(message.getEventId());
        if (ownerId != null) {
            evictUserKeys(ownerId);
        }
        evictGlobalKeys();
    }

    @RabbitHandler
    public void handleRegistrationCompleted(RegistrationCompletedMessage message) {
        log.info("Received RegistrationCompletedMessage for volunteer: {}, eventId: {}", message.getUserId(), message.getEventId());
        evictUserKeys(message.getUserId());
        
        String ownerId = fetchEventOwnerId(message.getEventId());
        if (ownerId != null) {
            evictUserKeys(ownerId);
        }
        evictGlobalKeys();
    }
}
