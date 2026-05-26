package com.vippro.AuthorizationServer.security;

import com.vippro.AuthorizationServer.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class SecurityUsers implements UserDetails {
    private final User user;

    public SecurityUsers(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(user.getRoles().name()));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    public String getName() {
        return user.getName();
    }

    public String getEmail() {
        return user.getEmail();
    }

    public UUID getId() {
        return user.getId();
    }
}
