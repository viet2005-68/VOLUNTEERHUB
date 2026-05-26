package com.volunteerhub.chatservice.publisher;

import com.volunteerhub.common.dto.message.chat.ChatMessageCreatedMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.notification}")
    private String notificationExchange;

    @Value("${rabbitmq.routingKey.chat}")
    private String chatRoutingKey;

    public void publishMessageCreated(ChatMessageCreatedMessage message) {
        rabbitTemplate.convertAndSend(notificationExchange, chatRoutingKey, message);
    }
}
