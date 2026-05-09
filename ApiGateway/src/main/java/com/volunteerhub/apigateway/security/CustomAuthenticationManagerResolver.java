package com.volunteerhub.apigateway.security;

import com.nimbusds.jwt.JWTParser;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationManagerResolver;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;

import java.util.HashMap;
import java.util.Map;

public class CustomAuthenticationManagerResolver implements AuthenticationManagerResolver<HttpServletRequest> {

    private final Map<String, AuthenticationManager> authenticationManagers = new HashMap<>();

    public CustomAuthenticationManagerResolver(CustomJwtAuthenticationConverter customJwtAuthenticationConverter,
                                               GoogleJwtAuthenticationConverter googleJwtAuthenticationConverter,
                                               String googleIssuer,
                                               String googleJwkUri,
                                               String volunteerHubIssuer,
                                               String volunteerHubJwkUri) {
        // VolunteerHub issuer
        JwtDecoder volunteerDecoder = NimbusJwtDecoder.withJwkSetUri(volunteerHubJwkUri).build();
        JwtAuthenticationProvider volunteerProvider = new JwtAuthenticationProvider(volunteerDecoder);
        volunteerProvider.setJwtAuthenticationConverter(customJwtAuthenticationConverter);
        authenticationManagers.put(volunteerHubIssuer, volunteerProvider::authenticate);

        // Google issuer
        JwtDecoder googleDecoder = NimbusJwtDecoder.withJwkSetUri(googleJwkUri).build();
        JwtAuthenticationProvider googleProvider = new JwtAuthenticationProvider(googleDecoder);
        googleProvider.setJwtAuthenticationConverter(googleJwtAuthenticationConverter);
        authenticationManagers.put(googleIssuer, googleProvider::authenticate);
    }

    @Override
    public AuthenticationManager resolve(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new IllegalArgumentException("No Bearer token found in request");
        }

        String token = header.substring(7);
        String issuer;
        try {
            SignedJWT signedJWT = (SignedJWT) JWTParser.parse(token);
            issuer = signedJWT.getJWTClaimsSet().getIssuer();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid JWT", e);
        }
        AuthenticationManager manager = authenticationManagers.get(issuer);
        if (manager == null) {
            throw new IllegalArgumentException("Unknown issuer: " + issuer);
        }

        return manager;
    }
}
