package com.volunteerhub.AggregationService.config;

import feign.Logger;
import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Enumeration;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor headerForwardingInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();

                Enumeration<String> headerNames = request.getHeaderNames();
                if (headerNames != null) {
                    while (headerNames.hasMoreElements()) {
                        String headerName = headerNames.nextElement();
                        String headerValue = request.getHeader(headerName);
                        requestTemplate.header(headerName, headerValue);
                    }
                }
            }
        };
    }

    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
}