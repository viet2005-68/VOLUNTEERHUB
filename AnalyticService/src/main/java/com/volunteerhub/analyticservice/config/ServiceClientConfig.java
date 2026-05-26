package com.volunteerhub.analyticservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.RestClient;

import java.util.stream.Collectors;

@Configuration
public class ServiceClientConfig {

    @Value("${services.user.url:http://localhost:8081/api/v1/users/users}")
    private String userServiceUrl;

    @Value("${services.event.url:http://localhost:8082/api/v1/events}")
    private String eventServiceUrl;

    @Value("${services.registration.url:http://localhost:8084/api/v1/registrations}")
    private String registrationServiceUrl;


    @Bean("userClient")
    public RestClient userClient(RestClient.Builder builder) {
        return createClient(builder, userServiceUrl);
    }

    @Bean("eventClient")
    public RestClient eventClient(RestClient.Builder builder) {
        return createClient(builder, eventServiceUrl);
    }

    @Bean("registrationClient")
    public RestClient registrationClient(RestClient.Builder builder) {
        return createClient(builder, registrationServiceUrl);
    }

    private RestClient createClient(RestClient.Builder builder, String baseUrl) {
        return builder
                .baseUrl(baseUrl)
                .requestInterceptor(authPropagationInterceptor())
                .build();
    }

    private ClientHttpRequestInterceptor authPropagationInterceptor() {
        return (request, body, execution) -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.isAuthenticated()) {
                String userId = authentication.getName();
                if (authentication.getAuthorities() != null) {
                    String roles = authentication.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.joining(","));
                    request.getHeaders().add("X-USER-ROLE", roles);
                }

                request.getHeaders().add("X-USER-ID", userId);
            }

            return execution.execute(request, body);
        };
    }
}