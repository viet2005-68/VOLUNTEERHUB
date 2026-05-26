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

    public static final String EVENT_EXCHANGE = "analysis-event-exchange";
    public static final String USER_EXCHANGE = "analysis-user-exchange";
    public static final String COMMUNITY_EXCHANGE = "analysis-community-exchange";
    public static final String REGISTRATION_EXCHANGE = "analysis-registration-exchange";

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
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    @Bean
    public TopicExchange communityExchange() {
        return new TopicExchange(COMMUNITY_EXCHANGE);
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
    public Binding bindUser(Queue analyticQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(analyticQueue).to(userExchange).with("user.*");
    }

    @Bean
    public Binding bindCommunity(Queue analyticQueue, TopicExchange communityExchange) {
        return BindingBuilder.bind(analyticQueue).to(communityExchange).with("community.*");
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

