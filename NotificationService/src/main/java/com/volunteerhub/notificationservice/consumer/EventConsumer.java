package com.volunteerhub.notificationservice.consumer;

import com.volunteerhub.common.dto.message.event.*;
import com.volunteerhub.notificationservice.config.RabbitMQConfig;
import com.volunteerhub.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EventConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.EVENT_QUEUE)
    public void handleEventEvent(EventMessage eventMessage) {
        if (eventMessage instanceof EventCreatedMessage) {
            notificationService.handleEventCreatedNotification((EventCreatedMessage) eventMessage);
        }
        else if (eventMessage instanceof EventApprovedMessage) {
            notificationService.handleEventApprovedNotification((EventApprovedMessage) eventMessage);
        }
        else if (eventMessage instanceof EventRejectedMessage) {
            notificationService.handleEventRejectedNotification((EventRejectedMessage) eventMessage);
        }
        else if (eventMessage instanceof EventUpdatedMessage) {
            notificationService.handleEventUpdatedNotification((EventUpdatedMessage) eventMessage);
        }
        else if (eventMessage instanceof EventDeletedMessage) {
            notificationService.handleEventDeletedNotification((EventDeletedMessage) eventMessage);
        }
    }
}
