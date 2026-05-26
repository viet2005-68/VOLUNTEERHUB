package com.volunteerhub.notificationservice.consumer;

import com.volunteerhub.common.dto.message.comment.CommentCreatedMessage;
import com.volunteerhub.notificationservice.config.RabbitMQConfig;
import com.volunteerhub.notificationservice.dto.request.NotificationRequest;
import com.volunteerhub.notificationservice.model.NotificationType;
import com.volunteerhub.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CommentConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.COMMENT_QUEUE)
    public void handleCommentEvent(CommentCreatedMessage commentMessage) {
        Map<String, Object> map = new HashMap<>();
        map.put("content", commentMessage.getContent());
        map.put("post_id", commentMessage.getPostId());
        map.put("comment_id", commentMessage.getCommentId());
        NotificationRequest notificationRequest = NotificationRequest
                .builder()
                .type(NotificationType.COMMENT_CREATED)
                .actorId(commentMessage.getOwnerId())
                .contextId(commentMessage.getEventId())
                .payload(map)
                .userIds(List.of(commentMessage.getUserId()))
                .build();
        notificationService.create(notificationRequest);
    }
}
