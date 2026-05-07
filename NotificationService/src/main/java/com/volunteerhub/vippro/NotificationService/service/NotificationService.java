package com.volunteerhub.vippro.NotificationService.service;

import com.volunteerhub.vippro.NotificationService.dto.request.NotificationRequest;
import com.volunteerhub.vippro.NotificationService.dto.response.NotificationResponse;
import com.volunteerhub.vippro.NotificationService.mapper.NotificationMapper;
import com.volunteerhub.vippro.NotificationService.model.Notification;
import com.volunteerhub.vippro.NotificationService.model.NotificationType;
import com.volunteerhub.vippro.NotificationService.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

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
    }

    private String resolveTitle(NotificationType type) {
        switch (type) {
            case EVENT_REQUESTED:
                return "Yêu cầu sự kiện mới";
            case EVENT_APPROVED:
                return "Sự kiện đã được duyệt";
            case EVENT_REJECTED:
                return "Sự kiện bị từ chối";
            case EVENT_DELETED:
                return "Sự kiện đã bị xoá";
            case EVENT_UPDATED:
                return "Sự kiện được cập nhật";

            case USER_EVENT_REQUESTED:
                return "Có người đăng ký sự kiện";
            case USER_EVENT_APPROVED:
                return "Đăng ký được chấp nhận";
            case USER_EVENT_REJECTED:
                return "Đăng ký bị từ chối";
            case USER_EVENT_COMPLETED:
                return "Sự kiện đã hoàn thành";

            case POST_CREATED:
                return "Bài viết mới";
            case POST_UPDATED:
                return "Bài viết được cập nhật";
            case COMMENT:
                return "Có bình luận mới";
            case REACTION:
                return "Có tương tác mới";

            case USER_ACTIVE:
                return "Tài khoản được kích hoạt";
            case USER_BANNED:
                return "Tài khoản bị khoá";

            default:
                return "Thông báo mới";
        }
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

}
