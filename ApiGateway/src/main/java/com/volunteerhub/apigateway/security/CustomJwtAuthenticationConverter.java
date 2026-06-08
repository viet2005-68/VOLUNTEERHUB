package com.volunteerhub.apigateway.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class CustomJwtAuthenticationConverter implements Converter<Jwt, JwtAuthenticationToken> {
    @Override
    public JwtAuthenticationToken convert(Jwt source) {
        List<GrantedAuthority> authorities = extractRoles(source.getClaim("roles"))
                .filter(role -> !role.isBlank())
                .map(CustomJwtAuthenticationConverter::normalizeRole)
                .distinct()
                .collect(Collectors.toList());

        return new JwtAuthenticationToken(source, authorities);
    }

    private static Stream<String> extractRoles(Object rolesClaim) {
        if (rolesClaim instanceof Collection<?> roles) {
            return roles.stream().map(CustomJwtAuthenticationConverter::extractRole);
        }

        return Stream.of(extractRole(rolesClaim));
    }

    private static String extractRole(Object roleClaim) {
        if (roleClaim instanceof String role) {
            return role;
        }

        if (roleClaim instanceof Map<?, ?> roleMap) {
            Object role = roleMap.get("role");
            if (role == null) {
                role = roleMap.get("authority");
            }
            return Objects.toString(role, "");
        }

        return "";
    }

    private static GrantedAuthority normalizeRole(String role) {
        String trimmed = role.trim();
        return new SimpleGrantedAuthority(trimmed.startsWith("ROLE_") ? trimmed : "ROLE_" + trimmed);
    }
}
