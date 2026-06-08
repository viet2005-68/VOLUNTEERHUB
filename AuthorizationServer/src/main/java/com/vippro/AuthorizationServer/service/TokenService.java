package com.vippro.AuthorizationServer.service;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.vippro.AuthorizationServer.security.SecurityUsers;
import com.vippro.AuthorizationServer.utils.Key;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
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
    private RSAPublicKey publicKey;

    /** Token lifetime: 24 hours (same as RegisteredClient.tokenSettings). */
    private static final long TOKEN_VALIDITY_SECONDS = 86_400;
    private static final long REFRESH_TOKEN_VALIDITY_SECONDS = 604_800;

    @PostConstruct
    public void init() throws Exception {
        Key key = new Key();
        this.privateKey = key.loadPrivateKey("private.pem");
        this.publicKey = key.loadPublicKey("public.pem");
    }

    public String issue(SecurityUsers user) {
        return issueToken(user, TOKEN_VALIDITY_SECONDS, "access");
    }

    public String issueRefreshToken(SecurityUsers user) {
        return issueToken(user, REFRESH_TOKEN_VALIDITY_SECONDS, "refresh");
    }

    private String issueToken(SecurityUsers user, long validitySeconds, String tokenType) {
        Instant now = Instant.now();

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(user.getId().toString())
                .issuer(issuerUri)
                .audience(audience)
                .issueTime(Date.from(now))
                .notBeforeTime(Date.from(now))
                .expirationTime(Date.from(now.plusSeconds(validitySeconds)))
                .jwtID(UUID.randomUUID().toString())
                .claim("token_type", tokenType)
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

    public long getRefreshTokenValiditySeconds() {
        return REFRESH_TOKEN_VALIDITY_SECONDS;
    }

    public UUID validateRefreshToken(String refreshToken) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(refreshToken);
            boolean validSignature = signedJWT.verify(new RSASSAVerifier(publicKey));
            if (!validSignature) {
                throw new IllegalArgumentException("Invalid refresh token signature");
            }

            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
            Date expiresAt = claims.getExpirationTime();
            if (expiresAt == null || expiresAt.before(new Date())) {
                throw new IllegalArgumentException("Refresh token is expired");
            }

            if (!issuerUri.equals(claims.getIssuer())) {
                throw new IllegalArgumentException("Invalid refresh token issuer");
            }

            if (!"refresh".equals(claims.getStringClaim("token_type"))) {
                throw new IllegalArgumentException("Token is not a refresh token");
            }

            return UUID.fromString(claims.getSubject());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid refresh token", e);
        }
    }
}
