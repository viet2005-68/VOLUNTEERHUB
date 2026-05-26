package com.volunteerhub.chatservice.dto;

import com.volunteerhub.common.enums.ChatConversationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatConversationResponse {

    private Long id;
    private Long eventId;
    private String managerId;
    private String volunteerId;
    private String otherUserId;
    private ChatConversationStatus status;
    private LocalDateTime lastMessageAt;
    private Long unreadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
