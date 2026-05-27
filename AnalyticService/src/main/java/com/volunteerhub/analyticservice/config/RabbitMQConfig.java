package com.volunteerhub.analyticservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.amqp.core.Queue;

@Configuration
public class RabbitMQConfig {

    public static final String EVENT_EXCHANGE = "event-exchange";
    public static final String NOTIFICATION_EXCHANGE = "notification-exchange";
    public static final String USER_NOTIFICATION_EXCHANGE = "user-notification-exchange";

    // Exchange cho publisher (cache / internal)
    public static final String ANALYTIC_EXCHANGE = "analytic-exchange";

    // Queue nhận message
    public static final String ANALYTIC_QUEUE = "analytic-queue";

    @Bean
    public Queue analyticQueue() {
        return new Queue(ANALYTIC_QUEUE, true);
    }

    @Bean
    public TopicExchange eventExchange() {
        return new TopicExchange(EVENT_EXCHANGE);
    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE);
    }

    @Bean
    public TopicExchange userNotificationExchange() {
        return new TopicExchange(USER_NOTIFICATION_EXCHANGE);
    }

    @Bean
    public TopicExchange analyticExchange() {
        return new TopicExchange(ANALYTIC_EXCHANGE);
    }

    // Bind queue để analytic-service nhận message
    @Bean
    public Binding bindEvent(Queue analyticQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(analyticQueue).to(eventExchange).with("event.*");
    }

    @Bean
    public Binding bindNotification(Queue analyticQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(analyticQueue).to(notificationExchange).with("notification.*");
    }

    @Bean
    public Binding bindUserNotification(Queue analyticQueue, TopicExchange userNotificationExchange) {
        return BindingBuilder.bind(analyticQueue).to(userNotificationExchange).with("user-notification.*");
    }

    // Message converter
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // RabbitTemplate để publish event
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         Jackson2JsonMessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}

