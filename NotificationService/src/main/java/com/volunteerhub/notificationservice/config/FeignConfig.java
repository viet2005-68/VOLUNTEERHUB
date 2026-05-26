package com.volunteerhub.notificationservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor authHeaderInterceptor() {
        return (RequestTemplate template) -> {
            template.header("X-USER-ID", "NOTIFICATION");
            template.header("X-USER-ROLE", "SYSTEM");
        };
    }
}
