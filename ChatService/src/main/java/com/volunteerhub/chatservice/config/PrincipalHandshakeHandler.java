package com.volunteerhub.chatservice.config;

import com.volunteerhub.chatservice.security.UserPrincipal;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Component
public class PrincipalHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request,
                                      WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {
        Object principal = attributes.get("principal");
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal;
        }
        return super.determineUser(request, wsHandler, attributes);
    }
}
