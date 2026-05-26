package com.volunteerhub.chatservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatMessageAttachmentRequest {

    @NotBlank
    private String type;

    @NotBlank
    private String url;

    @NotBlank
    private String mimeType;

    @NotBlank
    private String fileName;

    @NotNull
    private Long size;

    private String storageKey;
}
