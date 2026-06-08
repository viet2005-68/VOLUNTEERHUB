package com.volunteerhub.eventservice.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
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
@ConditionalOnExpression("'${firebase.projectId:}' != '' && '${firebase.storage.bucket:}' != '' && " +
        "('${firebase.credentials.base64:}' != '' || '${firebase.credentials.location:}' != '')")
public class FirebaseConfig implements ResourceLoaderAware {

    private ResourceLoader resourceLoader;

    @Value("${firebase.projectId}")
    private String projectId;

    @Value("${firebase.storage.bucket}")
    private String bucketName;

    @Value("${firebase.credentials.location:}")
    private String credentialsLocation;

    @Value("${firebase.credentials.base64:}")
    private String credentialsBase64;

    @Override
    public void setResourceLoader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Bean
    FirebaseApp firebaseApp() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }
        try (InputStream inputStream = credentialsStream()) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setProjectId(projectId)
                    .setCredentials(GoogleCredentials.fromStream(inputStream))
                    .setStorageBucket(bucketName)
                    .build();
            return FirebaseApp.initializeApp(options);
        }
    }

    @Bean
    public Storage storage() throws IOException {
        try (InputStream inputStream = credentialsStream()) {
            return StorageOptions.newBuilder()
                    .setCredentials(GoogleCredentials.fromStream(inputStream))
                    .setProjectId(projectId)
                    .build()
                    .getService();
        }
    }

    private InputStream credentialsStream() throws IOException {
        if (StringUtils.hasText(credentialsBase64)) {
            return new ByteArrayInputStream(Base64.getDecoder().decode(credentialsBase64));
        }
        if (!StringUtils.hasText(credentialsLocation)) {
            throw new IllegalStateException("Firebase credential location or base64 value must be configured.");
        }

        Resource resource = resourceLoader.getResource(credentialsLocation);
        if (!resource.exists()) {
            throw new IllegalStateException("Firebase credential resource does not exist: " + credentialsLocation);
        }
        return resource.getInputStream();
    }
}
