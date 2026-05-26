package com.volunteerhub.chatservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatMediaUploadResponse {

    private String type;
    private String url;
    private String mimeType;
    private String fileName;
    private Long size;
    private String storageKey;
}
