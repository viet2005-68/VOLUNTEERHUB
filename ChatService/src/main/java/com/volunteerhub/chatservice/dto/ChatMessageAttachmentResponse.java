package com.volunteerhub.chatservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatMessageAttachmentResponse {

    private Long id;
    private String type;
    private String url;
    private String mimeType;
    private String fileName;
    private Long size;
}
