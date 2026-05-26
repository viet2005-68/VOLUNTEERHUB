package com.volunteerhub.chatservice.security;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class JwtHandshakeService {

    @Value("${spring.security.oauth2.google.issuer:}")
    private String googleIssuer;

    @Value("${spring.security.oauth2.google.jwk-uri:}")
    private String googleJwkUri;

    @Value("${spring.security.oauth2.volunteerhub.issuer:}")
    private String volunteerHubIssuer;

    @Value("${spring.security.oauth2.volunteerhub.jwk-uri:}")
    private String volunteerHubJwkUri;

    private final Map<String, JwtDecoder> decoders = new HashMap<>();

    @PostConstruct
    void init() {
        addDecoder(volunteerHubIssuer, volunteerHubJwkUri);
        addDecoder(googleIssuer, googleJwkUri);
    }

    public UserPrincipal resolvePrincipal(HttpHeaders headers, URI uri) {
        String headerUserId = headers.getFirst("X-USER-ID");
        if (headerUserId != null && !headerUserId.isBlank()) {
            String role = headers.getFirst("X-USER-ROLE");
            return new UserPrincipal(headerUserId, role == null ? "ROLE_USER" : role);
        }

        String token = bearerToken(headers, uri);
        if (token == null) {
            return null;
        }
        Jwt unverified = Jwt.withTokenValue(token)
                .header("alg", "none")
                .claim("iss", "")
                .subject("")
                .build();
        String issuer = unsafeIssuer(token);
        JwtDecoder decoder = decoders.get(issuer);
        if (decoder == null) {
            return null;
        }
        Jwt jwt = decoder.decode(unverified.getTokenValue());
        return new UserPrincipal(jwt.getSubject(), resolveRole(jwt));
    }

    private void addDecoder(String issuer, String jwkUri) {
        if (issuer != null && !issuer.isBlank() && jwkUri != null && !jwkUri.isBlank()) {
            decoders.put(issuer, NimbusJwtDecoder.withJwkSetUri(jwkUri).build());
        }
    }

    private String bearerToken(HttpHeaders headers, URI uri) {
        String auth = headers.getFirst(HttpHeaders.AUTHORIZATION);
        if (auth != null && auth.startsWith("Bearer ")) {
            return auth.substring(7);
        }
        return UriComponentsBuilder.fromUri(uri).build().getQueryParams().getFirst("access_token");
    }

    private String unsafeIssuer(String token) {
        try {
            String payload = new String(java.util.Base64.getUrlDecoder().decode(token.split("\\.")[1]));
            int index = payload.indexOf("\"iss\"");
            if (index < 0) return "";
            int colon = payload.indexOf(':', index);
            int firstQuote = payload.indexOf('"', colon + 1);
            int secondQuote = payload.indexOf('"', firstQuote + 1);
            return payload.substring(firstQuote + 1, secondQuote);
        } catch (Exception e) {
            return "";
        }
    }

    private String resolveRole(Jwt jwt) {
        Object roles = jwt.getClaim("roles");
        if (roles instanceof List<?> list && !list.isEmpty() && list.getFirst() instanceof Map<?, ?> roleMap) {
            Object role = roleMap.get("role");
            if (role != null) {
                return "ROLE_" + role;
            }
        }
        return "ROLE_USER";
    }
}
