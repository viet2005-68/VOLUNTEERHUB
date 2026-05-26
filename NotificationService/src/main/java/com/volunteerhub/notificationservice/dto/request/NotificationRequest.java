package com.volunteerhub.notificationservice.dto.request;

import com.volunteerhub.notificationservice.model.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class NotificationRequest {
    private NotificationType type;
    private String actorId;
    private Long contextId;
    private List<String> userIds;
    private Map<String, Object> payload;
}
