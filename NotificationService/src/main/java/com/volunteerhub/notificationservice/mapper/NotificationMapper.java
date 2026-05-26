package com.volunteerhub.notificationservice.mapper;

import com.volunteerhub.notificationservice.dto.response.NotificationResponse;
import com.volunteerhub.notificationservice.model.Notification;
import com.volunteerhub.notificationservice.service.NotificationContentResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationMapper {

    private final NotificationContentResolver notificationContentResolver;

    public NotificationResponse toResponseDTO(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .actorId(notification.getActorId())
                .contextId(notification.getContextId())
                .title(notificationContentResolver.resolveTitle(notification.getType()))
                .body(notificationContentResolver.buildBody(notification))
                .userId(notification.getUserId())
                .payload(notification.getPayload())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
