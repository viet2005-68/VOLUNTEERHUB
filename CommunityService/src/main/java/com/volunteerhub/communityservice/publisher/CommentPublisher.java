package com.volunteerhub.communityservice.publisher;

import com.volunteerhub.common.dto.message.comment.CommentCreatedMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CommentPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.notification}")
    private String exchange;

    @Value("${rabbitmq.routingKey.comment}")
    private String routingKey;

    public void publishCommentCreatedEvent(CommentCreatedMessage commentCreatedMessage) {
        rabbitTemplate.convertAndSend(
                exchange,
                routingKey,
                commentCreatedMessage
        );
    }
}
