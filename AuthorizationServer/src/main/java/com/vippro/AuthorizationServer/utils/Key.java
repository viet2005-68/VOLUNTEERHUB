package com.vippro.AuthorizationServer.utils;

import org.springframework.stereotype.Component;

import java.io.FileNotFoundException;
import java.io.InputStream;
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
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(fileName)) {
            assert is != null;
            String key = new String(is.readAllBytes())
                    .replaceAll("-----BEGIN PUBLIC KEY-----", "")
                    .replaceAll("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] decoded = Base64.getDecoder().decode(key);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decoded);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            PublicKey pubKey = kf.generatePublic(keySpec);
            return (RSAPublicKey) pubKey;
        }
    }

    public RSAPrivateKey loadPrivateKey(String fileName) throws Exception {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(fileName)) {
            if (is == null) {
                throw new FileNotFoundException("Public key resource not found in classpath: " + fileName);
            }

            String key = new String(is.readAllBytes())
                    .replaceAll("-----BEGIN ([A-Z ]+)-----", "")
                    .replaceAll("-----END ([A-Z ]+)-----", "")
                    .replaceAll("\\s+", "");
            byte[] decoded = Base64.getDecoder().decode(key);
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decoded);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            PrivateKey privKey = kf.generatePrivate(keySpec);
            return (RSAPrivateKey) privKey;
        }
    }
}
