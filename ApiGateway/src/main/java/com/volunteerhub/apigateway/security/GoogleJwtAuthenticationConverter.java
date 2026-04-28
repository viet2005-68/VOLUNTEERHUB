package com.volunteerhub.apigateway.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;

public class GoogleJwtAuthenticationConverter implements Converter<Jwt, JwtAuthenticationToken> {

    @Override
    public JwtAuthenticationToken convert(Jwt source) {
        List<GrantedAuthority> authorities = List.of(() -> "ROLE_USER");
        return new JwtAuthenticationToken(source, authorities);
    }
}