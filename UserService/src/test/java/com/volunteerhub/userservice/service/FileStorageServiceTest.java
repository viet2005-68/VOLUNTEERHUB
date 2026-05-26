package com.volunteerhub.userservice.service;

import com.google.cloud.storage.Storage;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class FileStorageServiceTest {

    @Test
    void uploadProfileAvatarRejectsEmptyFiles() {
        @SuppressWarnings("unchecked")
        ObjectProvider<Storage> storageProvider = mock(ObjectProvider.class);
        FileStorageService fileStorageService = new FileStorageService(storageProvider);
        MockMultipartFile avatarFile = new MockMultipartFile(
                "avatarFile",
                "avatar.png",
                "image/png",
                new byte[0]
        );

        assertThatThrownBy(() -> fileStorageService.uploadProfileAvatar("user-1", avatarFile))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("File is empty");
        verifyNoInteractions(storageProvider);
    }

    @Test
    void uploadProfileAvatarRejectsNonImageFiles() {
        @SuppressWarnings("unchecked")
        ObjectProvider<Storage> storageProvider = mock(ObjectProvider.class);
        FileStorageService fileStorageService = new FileStorageService(storageProvider);
        MockMultipartFile avatarFile = new MockMultipartFile(
                "avatarFile",
                "avatar.txt",
                "text/plain",
                "not an image".getBytes()
        );

        assertThatThrownBy(() -> fileStorageService.uploadProfileAvatar("user-1", avatarFile))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Only JPEG, PNG, WebP, and GIF images are allowed");
        verifyNoInteractions(storageProvider);
    }
}
