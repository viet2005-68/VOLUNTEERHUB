package com.volunteerhub.notificationservice.consumer;

import com.volunteerhub.common.dto.message.post.PostCreatedMessage;
import com.volunteerhub.notificationservice.client.RegistrationServiceClient;
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
public class PostConsumer {

    private final NotificationService notificationService;
    private final RegistrationServiceClient registrationServiceClient;

    @RabbitListener(queues = RabbitMQConfig.POST_QUEUE)
    public void handlePostEvent(PostCreatedMessage postCreatedMessage) {
        Map<String, Object> map = new HashMap<>();
        map.put("content", postCreatedMessage.getContent());
        map.put("post_id", postCreatedMessage.getPostId());
        List<String> participantIds = registrationServiceClient.findAllUserIdsByEventId(postCreatedMessage.getEventId());
        NotificationRequest notificationRequest = NotificationRequest
                .builder()
                .type(NotificationType.POST_CREATED)
                .actorId(postCreatedMessage.getOwnerId())
                .contextId(postCreatedMessage.getEventId())
                .payload(map)
                .userIds(participantIds)
                .build();
        notificationService.create(notificationRequest);
    }
}
