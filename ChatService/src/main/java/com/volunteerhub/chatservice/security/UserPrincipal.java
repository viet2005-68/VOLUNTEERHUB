package com.volunteerhub.chatservice.security;

import java.security.Principal;

public record UserPrincipal(String name, String role) implements Principal {
    @Override
    public String getName() {
        return name;
    }
}
