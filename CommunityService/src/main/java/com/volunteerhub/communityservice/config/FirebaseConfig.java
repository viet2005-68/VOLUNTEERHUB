package com.volunteerhub.communityservice.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.projectId}")
    private String projectId;

    @Value("${firebase.storage.bucket}")
    private String bucketName;

    @Bean
    FirebaseApp firebaseApp() throws IOException {
        ClassPathResource resource = new ClassPathResource("storageServiceAccountKey.json");
        InputStream inputStream = resource.getInputStream();
        FirebaseOptions options = FirebaseOptions.builder()
                .setProjectId(projectId)
                .setCredentials(GoogleCredentials.fromStream(inputStream))
                .setStorageBucket(bucketName)
                .build();
        return FirebaseApp.initializeApp(options);
    }

    @Bean
    public Storage storage() throws IOException {
        ClassPathResource resource = new ClassPathResource("storageServiceAccountKey.json");
        InputStream inputStream = resource.getInputStream();
        return StorageOptions.newBuilder()
                .setCredentials(GoogleCredentials.fromStream(inputStream))
                .setProjectId(projectId)
                .build()
                .getService();
    }
}
