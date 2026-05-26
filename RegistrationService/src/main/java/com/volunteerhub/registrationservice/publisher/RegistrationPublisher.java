package com.volunteerhub.registrationservice.publisher;

import com.volunteerhub.common.dto.message.registration.RegistrationMessage;
import com.volunteerhub.registrationservice.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RegistrationPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishEvent(RegistrationMessage registrationMessage) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_REGISTRATION_ROUTING_KEY,
                registrationMessage
        );
    }
}
