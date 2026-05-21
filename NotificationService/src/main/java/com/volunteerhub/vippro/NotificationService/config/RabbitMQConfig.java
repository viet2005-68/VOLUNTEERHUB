package com.volunteerhub.vippro.NotificationService.config;

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
    public static final String EXCHANGE = "notification-exchange";

    public static final String EVENT_QUEUE = "notification-event-queue";
    public static final String POST_QUEUE = "notification-post-queue";
    public static final String COMMENT_QUEUE = "notification-comment-queue";
    public static final String REACTION_QUEUE = "notification-reaction-queue";
    public static final String REGISTRATION_QUEUE = "notification-registration-queue";

    public static final String EVENT_ROUTING_KEY = "notification.event";
    public static final String POST_ROUTING_KEY = "notification.post";
    public static final String COMMENT_ROUTING_KEY = "notification.comment";
    public static final String REACTION_ROUTING_KEY = "notification.reaction";
    public static final String REGISTRATION_ROUTING_KEY = "notification.registration";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue postQueue() {
        return new Queue(POST_QUEUE, true);
    }

    @Bean
    public Queue commentQueue() {
        return new Queue(COMMENT_QUEUE, true);
    }

    @Bean
    public Queue reactionQueue() {
        return new Queue(REACTION_QUEUE, true);
    }

    @Bean
    public Queue eventQueue() {
        return new Queue(EVENT_QUEUE, true);
    }

    @Bean
    public Queue registrationQueue() {
        return new Queue(REGISTRATION_QUEUE, true);
    }

    @Bean
    public Binding postBinding(TopicExchange exchange, Queue postQueue) {
        return BindingBuilder.bind(postQueue).to(exchange).with(POST_ROUTING_KEY);
    }

    @Bean
    public Binding commentBinding(TopicExchange exchange, Queue commentQueue) {
        return BindingBuilder.bind(commentQueue).to(exchange).with(COMMENT_ROUTING_KEY);
    }

    @Bean
    public Binding reactionBinding(TopicExchange exchange, Queue reactionQueue) {
        return BindingBuilder.bind(reactionQueue).to(exchange).with(REACTION_ROUTING_KEY);
    }

    @Bean
    public Binding eventBinding(TopicExchange exchange, Queue eventQueue) {
        return BindingBuilder.bind(eventQueue).to(exchange).with(EVENT_ROUTING_KEY);
    }

    @Bean
    public Binding registratioinBinding(TopicExchange exchange, Queue registrationQueue) {
        return BindingBuilder.bind(registrationQueue).to(exchange).with(REGISTRATION_ROUTING_KEY);
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
