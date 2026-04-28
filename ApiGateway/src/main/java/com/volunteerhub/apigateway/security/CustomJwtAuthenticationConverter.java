package com.volunteerhub.apigateway.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CustomJwtAuthenticationConverter implements Converter<Jwt, JwtAuthenticationToken> {
    @Override
    public JwtAuthenticationToken convert(Jwt source) {
        Object rolesClaimObj = source.getClaim("roles");

        // Safe cast to List<Map<String, Object>>
        List<Map<String, Object>> rolesClaim;
        if (rolesClaimObj instanceof List<?>) {
            rolesClaim = ((List<?>) rolesClaimObj).stream()
                    .filter(item -> item instanceof Map)
                    .map(item -> (Map<String, Object>) item)
                    .collect(Collectors.toList());
        } else {
            rolesClaim = Collections.emptyList();
        }

        List<GrantedAuthority> authorities = rolesClaim.stream()
                .map(roleMap -> new SimpleGrantedAuthority("ROLE_" + roleMap.get("role")))
                .collect(Collectors.toList());

        return new JwtAuthenticationToken(source, authorities);
    }
}
