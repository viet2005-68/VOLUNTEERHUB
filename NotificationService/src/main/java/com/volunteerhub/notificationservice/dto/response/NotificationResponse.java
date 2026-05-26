package com.volunteerhub.notificationservice.dto.response;

import com.volunteerhub.notificationservice.model.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class NotificationResponse {

    private Long id;
    private NotificationType type;
    private String actorId;
    private Long contextId;
    private String title;
    private String body;
    private String userId;
    private Map<String, Object> payload;
    private Boolean isRead;
    public LocalDateTime createdAt;
}
