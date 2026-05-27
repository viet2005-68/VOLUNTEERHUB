package com.volunteerhub.notificationservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.volunteerhub.common.dto.message.chat.ChatMessageCreatedMessage;
import com.volunteerhub.common.dto.message.event.*;
import com.volunteerhub.common.dto.message.registration.RegistrationApprovedMessage;
import com.volunteerhub.common.dto.message.registration.RegistrationCompletedMessage;
import com.volunteerhub.common.dto.message.registration.RegistrationCreatedMessage;
import com.volunteerhub.common.dto.message.registration.RegistrationRejectedMessage;
import com.volunteerhub.common.dto.message.user.UserUpdatedMessage;
import com.volunteerhub.common.enums.UserRole;
import com.volunteerhub.common.enums.UserStatus;
import com.volunteerhub.notificationservice.client.RegistrationServiceClient;
import com.volunteerhub.notificationservice.client.UserServiceClient;
import com.volunteerhub.notificationservice.dto.request.NotificationRequest;
import com.volunteerhub.notificationservice.dto.response.NotificationResponse;
import com.volunteerhub.notificationservice.mapper.NotificationMapper;
import com.volunteerhub.notificationservice.model.Notification;
import com.volunteerhub.notificationservice.model.NotificationType;
import com.volunteerhub.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserServiceClient userServiceClient;
    private final NotificationMapper notificationMapper;
    private final RegistrationServiceClient registrationServiceClient;
    private final WebPushService webPushService;
    private final MobilePushService mobilePushService;
    private final ObjectMapper objectMapper;
    private final NotificationContentResolver notificationContentResolver;

    public Notification findEntityById(Long id) {
        return notificationRepository.findById(id).orElseThrow(() ->
                new NoSuchElementException("Notification with id " + id + " does not exist"));
    }

    public void create(NotificationRequest request) {
        List<Notification> notifications = request.getUserIds().stream()
                .map(userId -> Notification.builder()
                        .type(request.getType())
                        .actorId(request.getActorId())
                        .contextId(request.getContextId())
                        .userId(userId)
                        .payload(request.getPayload())
                        .build())
                .toList();

        notificationRepository.saveAll(notifications);
        notifications.forEach(this::push);
    }

    private void push(Notification notification) {
        try {
            Map<String, Object> pushPayload = payload(
                    "title", notificationContentResolver.resolveTitle(notification.getType()),
                    "body", notificationContentResolver.buildBody(notification),
                    "contextId", notification.getContextId(),
                    "type", notification.getType()
            );
            webPushService.pushToUser(
                    notification.getUserId(),
                    objectMapper.writeValueAsString(pushPayload)
            );
            mobilePushService.pushToUser(
                    notification.getUserId(),
                    objectMapper.writeValueAsString(pushPayload)
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<NotificationResponse> getAllNotification(String userId, Integer pageNum, Integer pageSize) {
        int page = (pageNum == null) ? 0 : pageNum;
        int size = (pageSize == null) ? 10 : pageSize;
        if (page < 0) {
            throw new IllegalArgumentException("Page number must be greater than or equal to 0");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be greater than 0");
        }
        return notificationRepository.findByUserIdOrderByIdDesc(userId, PageRequest.of(page, size)).getContent()
                .stream()
                .map(notificationMapper::toResponseDTO)
                .toList();
    }

    public NotificationResponse markAsRead(String userId, Long notificationId) {
        Notification notification = findEntityById(notificationId);
        if (!notification.getUserId().equals(userId)) {
            throw new AccessDeniedException("Insufficient permission to modify this record.");
        }
        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
        return notificationMapper.toResponseDTO(notification);
    }

    public NotificationResponse delete(String userId, Long notificationId) {
        Notification notification = findEntityById(notificationId);
        if (!userId.equals(notification.getUserId())) {
            throw new AccessDeniedException("Insufficient permission to modify this record.");
        }
        notificationRepository.delete(notification);
        return notificationMapper.toResponseDTO(notification);
    }

    /**
     * This method should handle the creation of notifications when an event is created.
     * @param eventCreatedMessage: the message publish by event service when an event created.
     */
    public void handleEventCreatedNotification(EventCreatedMessage eventCreatedMessage) {
        create(NotificationRequest.builder()
                .type(NotificationType.EVENT_REQUESTED)
                .actorId(eventCreatedMessage.getOwnerId())
                .contextId(eventCreatedMessage.getId())
                .userIds(userServiceClient.findAllUserIds(UserRole.ADMIN))
                .payload(payload(
                        "category", eventCreatedMessage.getCategory().getName(),
                        "name", eventCreatedMessage.getName(),
                        "imageUrl", eventCreatedMessage.getImageUrl(),
                        "start_time", eventCreatedMessage.getStartTime(),
                        "end_time", eventCreatedMessage.getEndTime()
                ))
                .build());
    }

    /**
     * This method should handle the creation of notifications when an event is approved.
     * @param eventApprovedMessage: the message publish by event service when an event approved.
     */
    public void handleEventApprovedNotification(EventApprovedMessage eventApprovedMessage) {
        create(singleUserRequest(
                NotificationType.EVENT_APPROVED,
                eventApprovedMessage.getApprovedBy(),
                eventApprovedMessage.getEventId(),
                eventApprovedMessage.getOwnerId(),
                payload(
                        "category", eventApprovedMessage.getCategory().getName(),
                        "name", eventApprovedMessage.getEventName(),
                        "imageUrl", eventApprovedMessage.getImageUrl(),
                        "approved_time", eventApprovedMessage.getApprovedTime()
                )
        ));
    }

    /**
     * This method should handle the creation of notifications when an event is rejected.
     * @param eventRejectedMessage: the message publish by event service when an event rejected.
     */
    public void handleEventRejectedNotification(EventRejectedMessage eventRejectedMessage) {
        create(singleUserRequest(
                NotificationType.EVENT_REJECTED,
                eventRejectedMessage.getApprovedBy(),
                eventRejectedMessage.getEventId(),
                eventRejectedMessage.getOwnerId(),
                payload(
                        "name", eventRejectedMessage.getEventName(),
                        "imageUrl", eventRejectedMessage.getImageUrl(),
                        "reason", eventRejectedMessage.getReason()
                )
        ));
    }

    /**
     * This method should handle the creation of notifications when an event is updated.
     * @param eventUpdatedMessage: the message publish by event service when an event updated.
     */
    public void handleEventUpdatedNotification(EventUpdatedMessage eventUpdatedMessage) {
        create(NotificationRequest.builder()
                .type(NotificationType.EVENT_UPDATED)
                .actorId(eventUpdatedMessage.getOwnerId())
                .contextId(eventUpdatedMessage.getId())
                .userIds(registrationServiceClient.findAllUserIdsByEventId(eventUpdatedMessage.getId()))
                .payload(payload("updated_fields", eventUpdatedMessage.getUpdatedFields()))
                .build());
    }

    /**
     * This method should handle the creation of notifications when an event is deleted.
     * @param eventDeletedMessage: the message publish by event service when an event deleted.
     */
    public void handleEventDeletedNotification(EventDeletedMessage eventDeletedMessage) {
        create(NotificationRequest.builder()
                .type(NotificationType.EVENT_DELETED)
                .actorId(eventDeletedMessage.getOwnerId())
                .contextId(eventDeletedMessage.getEventId())
                .userIds(registrationServiceClient.findAllUserIdsByEventId(eventDeletedMessage.getEventId()))
                .payload(payload("name", eventDeletedMessage.getName()))
                .build());
    }

    public void handleRegistrationCreatedNotification(RegistrationCreatedMessage registrationCreatedMessage) {
        create(singleUserRequest(
                NotificationType.USER_EVENT_REQUESTED,
                registrationCreatedMessage.getUserId(),
                registrationCreatedMessage.getEventId(),
                registrationCreatedMessage.getEventOwnerId(),
                payload(
                        "imageUrl", registrationCreatedMessage.getImageUrl(),
                        "requested_at", registrationCreatedMessage.getCreatedAt()
                )
        ));
    }

    public void handleRegistrationApprovedNotification(RegistrationApprovedMessage registrationApprovedMessage) {
        create(singleUserRequest(
                NotificationType.USER_EVENT_APPROVED,
                registrationApprovedMessage.getEventId().toString(),
                registrationApprovedMessage.getEventId(),
                registrationApprovedMessage.getUserId(),
                payload(
                        "imageUrl", registrationApprovedMessage.getImageUrl(),
                        "reviewed_at", registrationApprovedMessage.getReviewedAt()
                )
        ));
    }

    public void handleRegistrationRejectedNotification(RegistrationRejectedMessage registrationRejectedMessage) {
        create(singleUserRequest(
                NotificationType.USER_EVENT_REJECTED,
                registrationRejectedMessage.getEventId().toString(),
                registrationRejectedMessage.getEventId(),
                registrationRejectedMessage.getUserId(),
                payload(
                        "imageUrl", registrationRejectedMessage.getImageUrl(),
                        "note", registrationRejectedMessage.getNote()
                )
        ));
    }

    public void handleRegistrationCompletedNotification(RegistrationCompletedMessage registrationCompletedMessage) {
        create(singleUserRequest(
                NotificationType.USER_EVENT_COMPLETED,
                registrationCompletedMessage.getEventId().toString(),
                registrationCompletedMessage.getEventId(),
                registrationCompletedMessage.getUserId(),
                payload(
                        "imageUrl", registrationCompletedMessage.getImageUrl(),
                        "completed_at", registrationCompletedMessage.getCompletedAt()
                )
        ));
    }

    public void handleChatMessageCreatedNotification(ChatMessageCreatedMessage chatMessageCreatedMessage) {
        create(singleUserRequest(
                NotificationType.CHAT_MESSAGE,
                chatMessageCreatedMessage.getSenderId(),
                chatMessageCreatedMessage.getConversationId(),
                chatMessageCreatedMessage.getRecipientId(),
                payload(
                        "event_id", chatMessageCreatedMessage.getEventId(),
                        "message_id", chatMessageCreatedMessage.getMessageId(),
                        "preview", chatMessageCreatedMessage.getPreview(),
                        "created_at", chatMessageCreatedMessage.getCreatedAt()
                )
        ));
    }

//    public void handleUserUpdatedNotification(UserUpdatedMessage userUpdatedMessage) {
//        Map<String, Object> payload = new HashMap<>();
//        payload.put("email", userUpdatedMessage.getEmail());
//        payload.put("status", userUpdatedMessage.getStatus().name());
//        payload.put("updated_at", userUpdatedMessage.getUpdatedAt());
//
//        Notification notification = Notification.builder()
//                .type(userUpdatedMessage.getStatus() == UserStatus.BANNED
//                        ? NotificationType.USER_BANNED
//                        : NotificationType.USER_ACTIVE)
//                .actorId(userUpdatedMessage.getAdminId().toString())
//                .contextId(userUpdatedMessage.getUserId().toString())
//                .userId(userUpdatedMessage.getUserId())
//                .payload(payload)
//                .build();
//
//        notificationRepository.save(notification);
//    }
    private NotificationRequest singleUserRequest(
            NotificationType type,
            String actorId,
            Long contextId,
            String userId,
            Map<String, Object> payload
    ) {
        return NotificationRequest.builder()
                .type(type)
                .actorId(actorId)
                .contextId(contextId)
                .userIds(List.of(userId))
                .payload(payload)
                .build();
    }

    private Map<String, Object> payload(Object... kv) {
        Map<String, Object> map = new HashMap<>();
        for (int i = 0; i < kv.length; i += 2) {
            if (kv[i + 1] != null) {
                map.put((String) kv[i], kv[i + 1]);
            }
        }
        return map;
    }
}
