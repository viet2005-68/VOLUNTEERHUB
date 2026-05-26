package com.volunteerhub.userservice.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final Set<String> ALLOWED_IMAGE_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final ObjectProvider<Storage> storageProvider;

    @Value("${firebase.storage.bucket:}")
    private String bucketName;

    public String uploadProfileAvatar(String userId, MultipartFile file) throws IOException {
        validateImage(file);

        Storage storage = storageProvider.getIfAvailable();
        if (storage == null || !StringUtils.hasText(bucketName)) {
            throw new IllegalStateException("Firebase Storage is not configured.");
        }

        String downloadToken = UUID.randomUUID().toString();
        String originalFilename = StringUtils.cleanPath(
                Objects.requireNonNullElse(file.getOriginalFilename(), "avatar")
        );
        String safeFilename = originalFilename.replaceAll("[^A-Za-z0-9._-]", "_");
        String safeUserId = userId.replaceAll("[^A-Za-z0-9._-]", "_");
        String objectName = String.format(
                "profiles/%s/avatar/%s_%s",
                safeUserId,
                UUID.randomUUID(),
                safeFilename
        );

        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .setMetadata(Map.of("firebaseStorageDownloadTokens", downloadToken))
                .build();

        storage.createFrom(blobInfo, new ByteArrayInputStream(file.getBytes()));

        return String.format(
                "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media&token=%s",
                bucketName,
                encodeUrlPart(objectName),
                encodeUrlPart(downloadToken)
        );
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty. Please upload a valid file");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Only JPEG, PNG, WebP, and GIF images are allowed");
        }
    }

    private String encodeUrlPart(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
