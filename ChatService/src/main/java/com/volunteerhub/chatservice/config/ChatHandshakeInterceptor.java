package com.volunteerhub.chatservice.config;

import com.volunteerhub.chatservice.security.JwtHandshakeService;
import com.volunteerhub.chatservice.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ChatHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtHandshakeService jwtHandshakeService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {
        UserPrincipal principal = jwtHandshakeService.resolvePrincipal(request.getHeaders(), request.getURI());
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return false;
        }
        attributes.put("principal", principal);
        attributes.put("userId", principal.getName());
        attributes.put("role", principal.role());
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
    }
}
