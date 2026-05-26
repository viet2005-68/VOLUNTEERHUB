package com.volunteerhub.chatservice.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.volunteerhub.chatservice.dto.ChatMediaUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatMediaStorageService {

    private static final Set<String> SUPPORTED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private final Storage storage;

    @Value("${firebase.storage.bucket}")
    private String bucketName;

    @Value("${chat.media.folder:chat}")
    private String folder;

    @Value("${chat.media.max-size-bytes:10485760}")
    private long maxSizeBytes;

    public ChatMediaUploadResponse storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required.");
        }
        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException("Image file is too large. Max size is " + maxSizeBytes + " bytes.");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!SUPPORTED_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG, PNG, WEBP and GIF images are supported.");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
        String extension = extensionFor(contentType, originalName);
        String downloadToken = UUID.randomUUID().toString();
        String storageKey = folder + "/" + UUID.randomUUID() + "_" + fileBaseName(originalName, extension) + extension;
        BlobId blobId = BlobId.of(bucketName, storageKey);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(contentType)
                .setMetadata(Map.of("firebaseStorageDownloadTokens", downloadToken))
                .build();
        try {
            storage.createFrom(blobInfo, file.getInputStream());
        } catch (IOException ex) {
            throw new IllegalStateException("Could not upload chat image to Firebase Storage.", ex);
        }

        return ChatMediaUploadResponse.builder()
                .type("IMAGE")
                .url(firebaseDownloadUrl(storageKey, downloadToken))
                .mimeType(contentType)
                .fileName(originalName)
                .size(file.getSize())
                .storageKey(storageKey)
                .build();
    }

    private String extensionFor(String contentType, String originalName) {
        int dot = originalName.lastIndexOf('.');
        if (dot >= 0 && dot < originalName.length() - 1) {
            String ext = originalName.substring(dot).toLowerCase(Locale.ROOT);
            if (ext.matches("\\.[a-z0-9]{1,8}")) {
                return ext;
            }
        }
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".img";
        };
    }

    private String fileBaseName(String originalName, String extension) {
        String baseName = originalName;
        if (baseName.toLowerCase(Locale.ROOT).endsWith(extension)) {
            baseName = baseName.substring(0, baseName.length() - extension.length());
        }
        baseName = baseName.replaceAll("[^a-zA-Z0-9._-]", "_");
        return baseName.isBlank() ? "image" : baseName;
    }

    private String firebaseDownloadUrl(String storageKey, String downloadToken) {
        return String.format(
                "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media&token=%s",
                bucketName,
                encodeUrlPart(storageKey),
                encodeUrlPart(downloadToken)
        );
    }

    private String encodeUrlPart(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
