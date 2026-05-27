package com.volunteerhub.AggregationService.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ChatMessageResponse {

    private Long id;
    private Long conversationId;
    private String senderId;
    private String body;
    private String clientMessageId;
    private List<ChatAttachmentResponse> attachments;
    private LocalDateTime createdAt;
}
