package com.volunteerhub.notificationservice.consumer;

import com.volunteerhub.common.dto.message.chat.ChatMessage;
import com.volunteerhub.common.dto.message.chat.ChatMessageCreatedMessage;
import com.volunteerhub.notificationservice.config.RabbitMQConfig;
import com.volunteerhub.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.CHAT_QUEUE)
    public void handleChatEvent(ChatMessage chatMessage) {
        if (chatMessage instanceof ChatMessageCreatedMessage createdMessage) {
            notificationService.handleChatMessageCreatedNotification(createdMessage);
        }
    }
}
