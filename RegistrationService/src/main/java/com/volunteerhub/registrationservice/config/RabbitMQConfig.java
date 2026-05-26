package com.volunteerhub.registrationservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EVENT_EXCHANGE = "event-exchange";
    public static final String EVENT_QUEUE = "event-queue";
    public static final String EVENT_ROUTING_QUEUE = "event.event";

    public static final String NOTIFICATION_EXCHANGE = "notification-exchange";
    public static final String NOTIFICATION_REGISTRATION_ROUTING_KEY = "notification.registration";

    @Bean
    public TopicExchange eventExchange() {
        return new TopicExchange(EVENT_EXCHANGE);
    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Queue queue() {
        return new Queue(EVENT_QUEUE);
    }

    @Bean
    public Binding binding(TopicExchange eventExchange, Queue queue) {
        return BindingBuilder.bind(queue).to(eventExchange).with(EVENT_ROUTING_QUEUE);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         Jackson2JsonMessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
