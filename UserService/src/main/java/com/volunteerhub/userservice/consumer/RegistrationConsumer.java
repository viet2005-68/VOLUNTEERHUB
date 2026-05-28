package com.volunteerhub.userservice.consumer;

import com.volunteerhub.common.dto.message.registration.RegistrationCompletedMessage;
import com.volunteerhub.common.dto.message.registration.RegistrationMessage;
import com.volunteerhub.userservice.config.RabbitMQConfig;
import com.volunteerhub.userservice.service.UserBadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RegistrationConsumer {
    private static final Long DEFAULT_COMPLETION_BADGE_ID = 8L;

    private final UserBadgeService userBadgeService;

    @RabbitListener(queues = RabbitMQConfig.REGISTRATION_QUEUE)
    public void handleRegistration(RegistrationMessage message) {
        if (!(message instanceof RegistrationCompletedMessage completedMessage)) {
            return;
        }

        userBadgeService.awardBadge(
                completedMessage.getUserId(),
                completedMessage.getCompletionBadgeId() == null
                        ? DEFAULT_COMPLETION_BADGE_ID
                        : completedMessage.getCompletionBadgeId()
        );
    }
}
