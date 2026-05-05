    package com.volunteerhub.eventservice.publisher;

    import com.volunteerhub.common.dto.message.event.EventApprovedMessage;
    import com.volunteerhub.common.dto.message.event.EventDeletedMessage;
    import com.volunteerhub.common.dto.message.event.EventMessage;
    import com.volunteerhub.common.dto.message.event.EventUpdatedMessage;
    import lombok.RequiredArgsConstructor;
    import org.springframework.amqp.rabbit.core.RabbitTemplate;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.stereotype.Component;

    @Component
    @RequiredArgsConstructor
    public class EventPublisher {

        private final RabbitTemplate rabbitTemplate;

        @Value("${rabbitmq.exchange.notification}")
        private String notificationExchange;

        @Value("${rabbitmq.exchange.event}")
        private String eventExchange;

        @Value("${rabbitmq.routingKey.event}")
        private String eventRoutingKey;

        @Value("${rabbitmq.routingKey.notification}")
        private String notificationRoutingKey;

        public void publishEvent(EventMessage eventMessage) {
            if (eventMessage instanceof EventApprovedMessage || eventMessage instanceof EventUpdatedMessage || eventMessage instanceof EventDeletedMessage) {
                // Publish to event exchange
                rabbitTemplate.convertAndSend(
                        eventExchange,
                        eventRoutingKey,
                        eventMessage
                );
            }
            // Publish to notification exchange
            rabbitTemplate.convertAndSend(
                    notificationExchange,
                    notificationRoutingKey,
                    eventMessage
            );
        }
    }
