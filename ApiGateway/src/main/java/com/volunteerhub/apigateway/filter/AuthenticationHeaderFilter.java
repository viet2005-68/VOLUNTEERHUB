package com.volunteerhub.apigateway.filter;

import com.volunteerhub.apigateway.client.UserClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.function.ServerRequest;

import java.util.function.Function;
import java.util.logging.Logger;

@Component
@RequiredArgsConstructor
public class AuthenticationHeaderFilter {

    private static final Logger logger = Logger.getLogger(AuthenticationHeaderFilter.class.getName());
    private final RedisTemplate<String, String> redisTemplate;
    private final UserClient userClient;

    public Function<ServerRequest, ServerRequest> addAuthenticationHeader() {
        return request -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null) {
                logger.info("MISSING CREDENTIAL");
                return request;
            }
            String userId = authentication.getName();
            String userStatus = redisTemplate.opsForValue().get(userId + "_status");
            if (userStatus == null) {
                logger.info("CACHE MISS, RESORTING TO USER SERVICE THROUGH HTTP");
                try {
                    userStatus = userClient.findUserStatus(userId);
                } catch (feign.FeignException.NotFound e) {
                    logger.info("USER NOT FOUND");
                    String role = authentication.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .findFirst()
                            .orElse("");
                    logger.info("VALID REQUEST, PASSING REQUEST TO DOWNSTREAM SERVICE");
                    return ServerRequest.from(request)
                            .header("X-USER-ID", userId)
                            .header("X-USER-ROLE", role)
                            .build();
                }
            }
            if (userStatus.equals("BANNED")) {
                logger.info("INVALID REQUEST - USER BANNED, ABORT");
                return request;
            }
            String role = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("");
            logger.info("VALID REQUEST, PASSING REQUEST TO DOWNSTREAM SERVICE");
            return ServerRequest.from(request)
                    .header("X-USER-ID", userId)
                    .header("X-USER-ROLE", role)
                    .build();
        };
    }
}
