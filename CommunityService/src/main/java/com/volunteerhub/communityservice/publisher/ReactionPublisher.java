package com.volunteerhub.communityservice.publisher;

import com.volunteerhub.common.dto.message.reaction.ReactionCreatedMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReactionPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.notification}")
    private String exchange;

    @Value("${rabbitmq.routingKey.reaction}")
    private String routingKey;

    public void publicReactionCreatedEvent(ReactionCreatedMessage reactionCreatedMessage) {
        rabbitTemplate.convertAndSend(
                exchange,
                routingKey,
                reactionCreatedMessage
        );
    }
}
