package com.volunteerhub.chatservice.mapper;

import com.volunteerhub.chatservice.dto.ChatConversationResponse;
import com.volunteerhub.chatservice.dto.ChatMessageAttachmentResponse;
import com.volunteerhub.chatservice.dto.ChatMessageResponse;
import com.volunteerhub.chatservice.model.ChatConversation;
import com.volunteerhub.chatservice.model.ChatMessage;
import org.springframework.stereotype.Component;

@Component
public class ChatMapper {

    public ChatConversationResponse toConversationResponse(ChatConversation conversation, String currentUserId, Long unreadCount) {
        String otherUserId = currentUserId.equals(conversation.getManagerId())
                ? conversation.getVolunteerId()
                : conversation.getManagerId();
        return ChatConversationResponse.builder()
                .id(conversation.getId())
                .eventId(conversation.getEventId())
                .managerId(conversation.getManagerId())
                .volunteerId(conversation.getVolunteerId())
                .otherUserId(otherUserId)
                .status(conversation.getStatus())
                .lastMessageAt(conversation.getLastMessageAt())
                .unreadCount(unreadCount)
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }

    public ChatMessageResponse toMessageResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversationId())
                .senderId(message.getSenderId())
                .body(message.getBody())
                .clientMessageId(message.getClientMessageId())
                .attachments(message.getAttachments().stream()
                        .map(attachment -> ChatMessageAttachmentResponse.builder()
                                .id(attachment.getId())
                                .type(attachment.getType())
                                .url(attachment.getUrl())
                                .mimeType(attachment.getMimeType())
                                .fileName(attachment.getFileName())
                                .size(attachment.getSize())
                                .build())
                        .toList())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
