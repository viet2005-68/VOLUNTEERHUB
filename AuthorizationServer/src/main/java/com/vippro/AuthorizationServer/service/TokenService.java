package com.vippro.AuthorizationServer.service;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.vippro.AuthorizationServer.security.SecurityUsers;
import com.vippro.AuthorizationServer.utils.Key;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.interfaces.RSAPrivateKey;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Issues JWT access tokens using the same RSA key pair as the OAuth2 Authorization Server.
 * Tokens produced here are accepted by ApiGateway's CustomJwtAuthenticationConverter
 * because the issuer and key are identical to the OIDC flow.
 */
@Service
public class TokenService {

    @Value("${spring.security.oauth2.authorizationserver.issuer-uri}")
    private String issuerUri;

    @Value("${spring.security.oauth2.authorizationserver.issuer-uri}")
    private String audience;

    private RSAPrivateKey privateKey;

    /** Token lifetime: 24 hours (same as RegisteredClient.tokenSettings). */
    private static final long TOKEN_VALIDITY_SECONDS = 86_400;

    @PostConstruct
    public void init() throws Exception {
        this.privateKey = new Key().loadPrivateKey("private.pem");
    }

    public String issue(SecurityUsers user) {
        Instant now = Instant.now();

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(user.getId().toString())
                .issuer(issuerUri)
                .audience(audience)
                .issueTime(Date.from(now))
                .notBeforeTime(Date.from(now))
                .expirationTime(Date.from(now.plusSeconds(TOKEN_VALIDITY_SECONDS)))
                .jwtID(UUID.randomUUID().toString())
                .claim("user_id", user.getId())
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("roles", List.of(Map.of("role", user.getAuthorities().stream()
                        .findFirst()
                        .map(a -> a.getAuthority())
                        .orElse("USER"))))
                .build();

        try {
            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.RS256),
                    claims
            );
            signedJWT.sign(new RSASSASigner(privateKey));
            return signedJWT.serialize();
        } catch (Exception e) {
            throw new RuntimeException("Failed to sign JWT", e);
        }
    }

    public long getTokenValiditySeconds() {
        return TOKEN_VALIDITY_SECONDS;
    }
}
