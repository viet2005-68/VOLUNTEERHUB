package com.volunteerhub.notificationservice.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ResourceLoaderAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.util.StringUtils;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

@Configuration
@ConditionalOnProperty(prefix = "firebase", name = "enabled", havingValue = "true")
public class FirebaseConfig implements ResourceLoaderAware {

    private ResourceLoader resourceLoader;

    @Value("${firebase.credentials.location:}")
    private String credentialsLocation;

    @Value("${firebase.credentials.base64:}")
    private String credentialsBase64;

    @Override
    public void setResourceLoader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        try (InputStream credentialsStream = credentialsStream()) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(credentialsStream))
                    .build();
            return FirebaseApp.initializeApp(options);
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        return FirebaseMessaging.getInstance(firebaseApp);
    }

    private InputStream credentialsStream() throws IOException {
        if (StringUtils.hasText(credentialsBase64)) {
            return new ByteArrayInputStream(Base64.getDecoder().decode(credentialsBase64));
        }
        if (!StringUtils.hasText(credentialsLocation)) {
            throw new IllegalStateException("Firebase is enabled but no credential location or base64 value is configured.");
        }

        Resource resource = resourceLoader.getResource(credentialsLocation);
        if (!resource.exists()) {
            throw new IllegalStateException("Firebase credential resource does not exist: " + credentialsLocation);
        }
        return resource.getInputStream();
    }
}
