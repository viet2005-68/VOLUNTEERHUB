package com.volunteerhub.common.dto.message.chat;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatMessageCreatedMessage implements ChatMessage {

    private Long messageId;
    private Long conversationId;
    private Long eventId;
    private String senderId;
    private String recipientId;
    private String preview;
    private LocalDateTime createdAt;
}
