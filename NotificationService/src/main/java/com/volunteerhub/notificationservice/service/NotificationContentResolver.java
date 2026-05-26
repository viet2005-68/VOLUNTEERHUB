package com.volunteerhub.notificationservice.service;

import com.volunteerhub.notificationservice.model.Notification;
import com.volunteerhub.notificationservice.model.NotificationType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class NotificationContentResolver {

    public String resolveTitle(NotificationType type) {
        return switch (type) {
            case EVENT_REQUESTED -> "Yêu cầu sự kiện mới";
            case EVENT_APPROVED -> "Sự kiện đã được duyệt";
            case EVENT_REJECTED -> "Sự kiện bị từ chối";
            case EVENT_DELETED -> "Sự kiện đã bị xoá";
            case EVENT_UPDATED -> "Sự kiện được cập nhật";
            case USER_EVENT_REQUESTED -> "Có người đăng ký sự kiện";
            case USER_EVENT_APPROVED -> "Đăng ký đã được duyệt";
            case USER_EVENT_REJECTED -> "Đăng ký bị từ chối";
            case USER_EVENT_COMPLETED -> "Sự kiện đã hoàn thành";
            case POST_CREATED -> "Bài viết mới";
            case POST_UPDATED -> "Bài viết được cập nhật";
            case COMMENT_CREATED, COMMENT -> "Có bình luận mới";
            case CHAT_MESSAGE -> "Tin nhắn mới";
            case REACTION_CREATED, REACTION -> "Có tương tác mới";
            case USER_ACTIVE -> "Tài khoản được kích hoạt";
            case USER_BANNED -> "Tài khoản bị khoá";
        };
    }

    public String buildBody(Notification notification) {
        Map<String, Object> payload = notification.getPayload() == null ? Map.of() : notification.getPayload();
        String eventName = text(payload.get("name"));

        return switch (notification.getType()) {
            case EVENT_APPROVED -> eventName == null
                    ? "Sự kiện đã được duyệt"
                    : eventName + " đã được duyệt";
            case EVENT_REJECTED -> eventName == null
                    ? "Sự kiện bị từ chối"
                    : eventName + " bị từ chối";
            case EVENT_UPDATED -> eventName == null
                    ? "Sự kiện vừa được cập nhật"
                    : "Sự kiện " + eventName + " vừa được cập nhật";
            case EVENT_DELETED -> eventName == null
                    ? "Sự kiện đã bị hủy"
                    : "Sự kiện " + eventName + " đã bị hủy";
            case USER_EVENT_REQUESTED -> eventName == null
                    ? "Bạn đã gửi đăng ký tham gia sự kiện"
                    : "Bạn đã gửi đăng ký tham gia " + eventName;
            case USER_EVENT_APPROVED -> eventName == null
                    ? "Bạn đã được duyệt tham gia sự kiện"
                    : "Bạn đã được duyệt tham gia " + eventName;
            case USER_EVENT_REJECTED -> eventName == null
                    ? "Đăng ký tham gia sự kiện của bạn đã bị từ chối"
                    : "Đăng ký tham gia " + eventName + " của bạn đã bị từ chối";
            case USER_EVENT_COMPLETED -> eventName == null
                    ? "Bạn đã hoàn thành sự kiện"
                    : "Bạn đã hoàn thành " + eventName;
            case CHAT_MESSAGE -> text(payload.get("preview"), "Bạn có tin nhắn mới");
            case POST_CREATED -> "Có bài viết mới trong sự kiện";
            case COMMENT_CREATED, COMMENT -> "Có bình luận mới trong sự kiện";
            case REACTION_CREATED, REACTION -> "Có tương tác mới trong sự kiện";
            default -> "Bạn có thông báo mới";
        };
    }

    private String text(Object value) {
        return text(value, null);
    }

    private String text(Object value, String fallback) {
        if (value == null || value.toString().isBlank()) {
            return fallback;
        }
        return value.toString();
    }
}
