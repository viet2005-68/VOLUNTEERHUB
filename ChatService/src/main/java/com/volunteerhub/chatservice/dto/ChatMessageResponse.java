package com.volunteerhub.chatservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ChatMessageResponse {

    private Long id;
    private Long conversationId;
    private String senderId;
    private String body;
    private String clientMessageId;
    private List<ChatMessageAttachmentResponse> attachments;
    private LocalDateTime createdAt;
}
