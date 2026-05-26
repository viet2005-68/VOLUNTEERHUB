package com.volunteerhub.notificationservice.consumer;

import com.volunteerhub.common.dto.message.registration.*;
import com.volunteerhub.notificationservice.config.RabbitMQConfig;
import com.volunteerhub.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RegistrationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.REGISTRATION_QUEUE)
    public void handleRegistrationEvent(RegistrationMessage registrationMessage) {
        if (registrationMessage instanceof RegistrationCreatedMessage) {
            notificationService.handleRegistrationCreatedNotification((RegistrationCreatedMessage) registrationMessage);
        }
        else if (registrationMessage instanceof RegistrationApprovedMessage) {
            notificationService.handleRegistrationApprovedNotification((RegistrationApprovedMessage) registrationMessage);
        }
        else if (registrationMessage instanceof RegistrationRejectedMessage) {
            notificationService.handleRegistrationRejectedNotification((RegistrationRejectedMessage) registrationMessage);
        }
        else if (registrationMessage instanceof RegistrationCompletedMessage) {
            notificationService.handleRegistrationCompletedNotification((RegistrationCompletedMessage) registrationMessage);
        }
    }
}
