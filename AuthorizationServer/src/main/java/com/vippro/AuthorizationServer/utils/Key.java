package com.vippro.AuthorizationServer.utils;

import org.springframework.stereotype.Component;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class Key {
    public RSAPublicKey loadPublicKey(String fileName) throws Exception {
        String key = readPem(fileName, "AUTH_PUBLIC_KEY_BASE64")
                .replaceAll("-----BEGIN PUBLIC KEY-----", "")
                .replaceAll("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");
        byte[] decoded = Base64.getDecoder().decode(key);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decoded);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PublicKey pubKey = kf.generatePublic(keySpec);
        return (RSAPublicKey) pubKey;
    }

    public RSAPrivateKey loadPrivateKey(String fileName) throws Exception {
        String key = readPem(fileName, "AUTH_PRIVATE_KEY_BASE64")
                .replaceAll("-----BEGIN ([A-Z ]+)-----", "")
                .replaceAll("-----END ([A-Z ]+)-----", "")
                .replaceAll("\\s+", "");
        byte[] decoded = Base64.getDecoder().decode(key);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decoded);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PrivateKey privKey = kf.generatePrivate(keySpec);
        return (RSAPrivateKey) privKey;
    }

    private String readPem(String fileName, String base64EnvName) throws Exception {
        String base64Pem = System.getenv(base64EnvName);
        if (base64Pem != null && !base64Pem.isBlank()) {
            return new String(Base64.getDecoder().decode(base64Pem), StandardCharsets.UTF_8);
        }

        try (InputStream is = getClass().getClassLoader().getResourceAsStream(fileName)) {
            if (is == null) {
                throw new FileNotFoundException("Key resource not found in classpath and " + base64EnvName + " is not configured: " + fileName);
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
