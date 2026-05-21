package com.volunteerhub.communityservice.publisher;

import com.volunteerhub.common.dto.message.post.PostCreatedMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PostPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.notification}")
    private String exchange;

    @Value("${rabbitmq.routingKey.post}")
    private String routingKey;

    public void publishPostCreatedEvent(PostCreatedMessage postCreatedMessage) {
        rabbitTemplate.convertAndSend(
                exchange,
                routingKey,
                postCreatedMessage
        );
    }
}
