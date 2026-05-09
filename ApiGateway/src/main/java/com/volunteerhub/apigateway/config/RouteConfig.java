package com.volunteerhub.apigateway.config;

import com.volunteerhub.apigateway.filter.AuthenticationHeaderFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;
import org.springframework.web.servlet.function.RequestPredicates;

import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;

@Configuration
@RequiredArgsConstructor
public class RouteConfig {

    private final AuthenticationHeaderFilter authenticationHeaderFilter;

    @Bean
    public RouterFunction<ServerResponse> userServiceRoute() {
        return route("userservice")
                .nest(RequestPredicates.path("/api/v1/users/**"), builder ->
                        builder
                                .GET(http())
                                .POST(http())
                                .PUT(http())
                                .DELETE(http())
                                .filter(lb("USERSERVICE"))
                                .before(authenticationHeaderFilter.addAuthenticationHeader())
                )
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> communityServiceRoute() {
        return route("communityservice")
                .nest(RequestPredicates.path("/api/v1/events/{eventId}/posts/**"), builder ->
                        builder
                                .GET(http())
                                .POST(http())
                                .PUT(http())
                                .DELETE(http())
                                .filter(lb("COMMUNITYSERVICE"))
                                .before(authenticationHeaderFilter.addAuthenticationHeader())
                )
                .build();

    }

    @Bean
    public RouterFunction<ServerResponse> eventServiceRoute() {
        return route("eventservice")
                .nest(RequestPredicates.path("/api/v1/events/**"), builder ->
                        builder
                                .GET(http())
                                .POST(http())
                                .PUT(http())
                                .DELETE(http())
                                .filter(lb("EVENTSERVICE"))
                                .before(authenticationHeaderFilter.addAuthenticationHeader())
                )
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> notificationServiceRoute() {
        return route("notificationservice")
                .nest(RequestPredicates.path("/api/v1/notifications/**"), builder ->
                        builder
                                .GET(http())
                                .POST(http())
                                .PUT(http())
                                .DELETE(http())
                                .filter(lb("NOTIFICATIONSERVICE"))
                                .before(authenticationHeaderFilter.addAuthenticationHeader())
                )
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> registrationServiceRoute() {
        return route("registrationservice")
                .nest(RequestPredicates.path("/api/v1/registrations/**"), builder ->
                        builder
                                .GET(http())
                                .POST(http())
                                .PUT(http())
                                .DELETE(http())
                                .filter(lb("REGISTRATIONSERVICE"))
                                .before(authenticationHeaderFilter.addAuthenticationHeader())
                )
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> aggregationServiceRoute() {
        return route("aggregationservice")
                .nest(RequestPredicates.path("/api/v1/aggregated/**"), builder ->
                        builder
                                .GET(http())
                                .POST(http())
                                .PUT(http())
                                .DELETE(http())
                                .filter(lb("AGGREGATIONSERVICE"))
                                .before(authenticationHeaderFilter.addAuthenticationHeader())
                )
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> analyticServiceRoute() {
        return route("analyticservice")
                .nest(RequestPredicates.path("/api/v1/analytics/**"), builder ->
                        builder
                                .GET(http())
                                .POST(http())
                                .PUT(http())
                                .DELETE(http())
                                .filter(lb("ANALYTICSERVICE"))
                                .before(authenticationHeaderFilter.addAuthenticationHeader())
                )
                .build();
    }
}
