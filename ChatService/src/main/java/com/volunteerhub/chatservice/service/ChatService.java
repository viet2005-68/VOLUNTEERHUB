package com.volunteerhub.chatservice.service;

import com.volunteerhub.chatservice.client.RegistrationClient;
import com.volunteerhub.chatservice.dto.*;
import com.volunteerhub.chatservice.mapper.ChatMapper;
import com.volunteerhub.chatservice.model.ChatConversation;
import com.volunteerhub.chatservice.model.ChatMessage;
import com.volunteerhub.chatservice.model.ChatMessageAttachment;
import com.volunteerhub.chatservice.model.ChatReadState;
import com.volunteerhub.chatservice.publisher.ChatPublisher;
import com.volunteerhub.chatservice.repository.ChatConversationRepository;
import com.volunteerhub.chatservice.repository.ChatMessageRepository;
import com.volunteerhub.chatservice.repository.ChatReadStateRepository;
import com.volunteerhub.common.dto.message.chat.ChatMessageCreatedMessage;
import com.volunteerhub.common.enums.ChatConversationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final RegistrationClient registrationClient;
    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final ChatReadStateRepository readStateRepository;
    private final ChatMapper chatMapper;
    private final ChatPublisher chatPublisher;
    private final ChatRealtimeService chatRealtimeService;

    @Transactional
    public ChatConversationResponse openConversation(String currentUserId, CreateConversationRequest request) {
        String volunteerId = request.getVolunteerId() == null || request.getVolunteerId().isBlank()
                ? currentUserId
                : request.getVolunteerId();
        ChatParticipantContext context = registrationClient.getChatParticipantContext(request.getEventId(), volunteerId);
        ensureNotSelfConversation(context);
        ensureCanRead(currentUserId, context);

        ChatConversation conversation = conversationRepository
                .findByEventIdAndManagerIdAndVolunteerId(context.getEventId(), context.getManagerId(), context.getVolunteerId())
                .orElseGet(() -> conversationRepository.save(ChatConversation.builder()
                        .eventId(context.getEventId())
                        .managerId(context.getManagerId())
                        .volunteerId(context.getVolunteerId())
                        .status(context.isCanSend() ? ChatConversationStatus.ACTIVE : ChatConversationStatus.READ_ONLY)
                        .build()));
        refreshConversationStatus(conversation, context);
        return chatMapper.toConversationResponse(conversationRepository.save(conversation), currentUserId, unreadCount(conversation, currentUserId));
    }

    @Transactional(readOnly = true)
    public List<ChatConversationResponse> listConversations(String currentUserId, Long eventId) {
        List<ChatConversation> conversations = eventId == null
                ? conversationRepository.findByManagerIdOrVolunteerIdOrderByLastMessageAtDesc(currentUserId, currentUserId)
                : conversationRepository.findByEventIdAndManagerIdOrEventIdAndVolunteerIdOrderByLastMessageAtDesc(
                        eventId, currentUserId, eventId, currentUserId
                );

        return conversations.stream()
                .filter(conversation -> !Objects.equals(conversation.getManagerId(), conversation.getVolunteerId()))
                .map(conversation -> chatMapper.toConversationResponse(conversation, currentUserId, unreadCount(conversation, currentUserId)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> listMessages(String currentUserId, Long conversationId, LocalDateTime before, Integer limit) {
        ChatConversation conversation = findConversation(conversationId);
        ensureConversationMember(currentUserId, conversation);
        int size = limit == null ? 50 : Math.max(1, Math.min(limit, 100));
        List<ChatMessage> messages = before == null
                ? messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, PageRequest.of(0, size))
                : messageRepository.findByConversationIdAndCreatedAtBeforeOrderByCreatedAtDesc(conversationId, before, PageRequest.of(0, size));
        return messages.stream()
                .map(chatMapper::toMessageResponse)
                .toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(String senderId, Long conversationId, SendMessageRequest request) {
        validateMessageContent(request);
        ChatConversation conversation = findConversation(conversationId);
        ensureConversationMember(senderId, conversation);
        messageRepository.findBySenderIdAndClientMessageId(senderId, request.getClientMessageId())
                .ifPresent(existing -> {
                    if (existing.getConversationId().equals(conversationId)) {
                        throw new IdempotentMessageException(chatMapper.toMessageResponse(existing));
                    }
                    throw new IllegalArgumentException("clientMessageId was already used for another conversation.");
                });

        ChatParticipantContext context = registrationClient.getChatParticipantContext(conversation.getEventId(), conversation.getVolunteerId());
        if (!context.isCanSend()) {
            conversation.setStatus(ChatConversationStatus.READ_ONLY);
            conversationRepository.save(conversation);
            throw new AccessDeniedException("Conversation is read-only for this event registration state.");
        }
        conversation.setStatus(ChatConversationStatus.ACTIVE);

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .senderId(senderId)
                .clientMessageId(request.getClientMessageId())
                .body(normalizedBody(request.getBody()))
                .attachments(new ArrayList<>())
                .build();
        for (ChatMessageAttachment attachment : toAttachments(request.getAttachments(), message)) {
            message.getAttachments().add(attachment);
        }

        ChatMessage savedMessage = messageRepository.save(message);
        savedMessage.setConversationId(conversation.getId());
        conversation.setLastMessageAt(savedMessage.getCreatedAt() == null ? LocalDateTime.now() : savedMessage.getCreatedAt());
        conversationRepository.save(conversation);

        ChatMessageResponse response = chatMapper.toMessageResponse(savedMessage);
        String recipientId = recipientId(senderId, conversation);
        chatPublisher.publishMessageCreated(ChatMessageCreatedMessage.builder()
                .messageId(savedMessage.getId())
                .conversationId(conversation.getId())
                .eventId(conversation.getEventId())
                .senderId(senderId)
                .recipientId(recipientId)
                .preview(preview(savedMessage))
                .createdAt(savedMessage.getCreatedAt())
                .build());
        chatRealtimeService.broadcastMessage(conversation.getId(), recipientId, response);
        return response;
    }

    @Transactional
    public ChatConversationResponse markRead(String currentUserId, Long conversationId, MarkReadRequest request) {
        ChatConversation conversation = findConversation(conversationId);
        ensureConversationMember(currentUserId, conversation);
        ChatReadState readState = readStateRepository.findByConversationIdAndUserId(conversationId, currentUserId)
                .orElseGet(() -> ChatReadState.builder()
                        .conversationId(conversationId)
                        .userId(currentUserId)
                        .build());
        readState.setLastReadAt(LocalDateTime.now());
        readState.setLastReadMessageId(request == null ? null : request.getLastReadMessageId());
        readStateRepository.save(readState);
        return chatMapper.toConversationResponse(conversation, currentUserId, 0L);
    }

    private ChatConversation findConversation(Long conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new NoSuchElementException("Conversation with id " + conversationId + " does not exist."));
    }

    private void ensureNotSelfConversation(ChatParticipantContext context) {
        if (Objects.equals(context.getManagerId(), context.getVolunteerId())) {
            throw new IllegalArgumentException("Cannot open a chat conversation with yourself.");
        }
    }

    private void ensureCanRead(String currentUserId, ChatParticipantContext context) {
        if (currentUserId.equals(context.getManagerId())) {
            return;
        }
        if (currentUserId.equals(context.getVolunteerId()) && context.isCanRead()) {
            return;
        }
        throw new AccessDeniedException("Insufficient permission to access this event chat.");
    }

    private void ensureConversationMember(String currentUserId, ChatConversation conversation) {
        if (!currentUserId.equals(conversation.getManagerId()) && !currentUserId.equals(conversation.getVolunteerId())) {
            throw new AccessDeniedException("Insufficient permission to access this conversation.");
        }
    }

    private void refreshConversationStatus(ChatConversation conversation, ChatParticipantContext context) {
        conversation.setStatus(context.isCanSend()
                ? ChatConversationStatus.ACTIVE
                : ChatConversationStatus.READ_ONLY);
    }

    private Long unreadCount(ChatConversation conversation, String currentUserId) {
        LocalDateTime after = readStateRepository.findByConversationIdAndUserId(conversation.getId(), currentUserId)
                .map(ChatReadState::getLastReadAt)
                .orElse(null);
        return after == null
                ? messageRepository.countByConversationIdAndSenderIdNot(conversation.getId(), currentUserId)
                : messageRepository.countByConversationIdAndSenderIdNotAndCreatedAtAfter(conversation.getId(), currentUserId, after);
    }

    private String recipientId(String senderId, ChatConversation conversation) {
        return senderId.equals(conversation.getManagerId())
                ? conversation.getVolunteerId()
                : conversation.getManagerId();
    }

    private String preview(String body) {
        String trimmed = body == null ? "" : body.trim();
        return trimmed.length() <= 120 ? trimmed : trimmed.substring(0, 120);
    }

    private String preview(ChatMessage message) {
        if (!message.getBody().isBlank()) {
            return preview(message.getBody());
        }
        return message.getAttachments().isEmpty() ? "" : "[Image]";
    }

    private void validateMessageContent(SendMessageRequest request) {
        boolean hasBody = request.getBody() != null && !request.getBody().trim().isBlank();
        boolean hasAttachments = request.getAttachments() != null && !request.getAttachments().isEmpty();
        if (!hasBody && !hasAttachments) {
            throw new IllegalArgumentException("Message body or at least one attachment is required.");
        }
    }

    private String normalizedBody(String body) {
        return body == null ? "" : body.trim();
    }

    private List<ChatMessageAttachment> toAttachments(List<ChatMessageAttachmentRequest> requests, ChatMessage message) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }
        return requests.stream()
                .map(request -> {
                    if (!"IMAGE".equalsIgnoreCase(request.getType())) {
                        throw new IllegalArgumentException("Only IMAGE attachments are supported.");
                    }
                    return ChatMessageAttachment.builder()
                            .message(message)
                            .type("IMAGE")
                            .url(request.getUrl())
                            .mimeType(request.getMimeType())
                            .fileName(request.getFileName())
                            .size(request.getSize())
                            .storageKey(request.getStorageKey() == null || request.getStorageKey().isBlank()
                                    ? request.getUrl()
                                    : request.getStorageKey())
                            .build();
                })
                .toList();
    }

    public static class IdempotentMessageException extends RuntimeException {
        private final ChatMessageResponse response;

        public IdempotentMessageException(ChatMessageResponse response) {
            this.response = response;
        }

        public ChatMessageResponse getResponse() {
            return response;
        }
    }
}
