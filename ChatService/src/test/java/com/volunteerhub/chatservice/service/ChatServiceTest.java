package com.volunteerhub.chatservice.service;

import com.volunteerhub.chatservice.client.RegistrationClient;
import com.volunteerhub.chatservice.dto.ChatParticipantContext;
import com.volunteerhub.chatservice.dto.ChatMessageAttachmentRequest;
import com.volunteerhub.chatservice.dto.CreateConversationRequest;
import com.volunteerhub.chatservice.dto.SendMessageRequest;
import com.volunteerhub.chatservice.mapper.ChatMapper;
import com.volunteerhub.chatservice.model.ChatConversation;
import com.volunteerhub.chatservice.model.ChatMessage;
import com.volunteerhub.chatservice.publisher.ChatPublisher;
import com.volunteerhub.chatservice.repository.ChatConversationRepository;
import com.volunteerhub.chatservice.repository.ChatMessageRepository;
import com.volunteerhub.chatservice.repository.ChatReadStateRepository;
import com.volunteerhub.common.enums.ChatConversationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ChatServiceTest {

    @Mock
    RegistrationClient registrationClient;
    @Mock
    ChatConversationRepository conversationRepository;
    @Mock
    ChatMessageRepository messageRepository;
    @Mock
    ChatReadStateRepository readStateRepository;
    @Mock
    ChatPublisher chatPublisher;
    @Mock
    ChatRealtimeService chatRealtimeService;

    ChatService chatService;

    @BeforeEach
    void setUp() {
        chatService = new ChatService(
                registrationClient,
                conversationRepository,
                messageRepository,
                readStateRepository,
                new ChatMapper(),
                chatPublisher,
                chatRealtimeService
        );
        when(readStateRepository.findByConversationIdAndUserId(any(), any())).thenReturn(Optional.empty());
        when(messageRepository.countByConversationIdAndSenderIdNot(any(), any())).thenReturn(0L);
        when(messageRepository.countByConversationIdAndSenderIdNotAndCreatedAtAfter(any(), any(), any())).thenReturn(0L);
    }

    @Test
    void managerCanOpenConversationWithRegisteredVolunteer() {
        ChatParticipantContext context = chatContext(true, true);
        when(registrationClient.getChatParticipantContext(1L, "volunteer-1")).thenReturn(context);
        when(conversationRepository.findByEventIdAndManagerIdAndVolunteerId(1L, "manager-1", "volunteer-1"))
                .thenReturn(Optional.empty());
        when(conversationRepository.save(any(ChatConversation.class))).thenAnswer(invocation -> {
            ChatConversation conversation = invocation.getArgument(0);
            conversation.setId(10L);
            return conversation;
        });

        CreateConversationRequest request = new CreateConversationRequest();
        request.setEventId(1L);
        request.setVolunteerId("volunteer-1");

        var response = chatService.openConversation("manager-1", request);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getStatus()).isEqualTo(ChatConversationStatus.ACTIVE);
        assertThat(response.getOtherUserId()).isEqualTo("volunteer-1");
    }

    @Test
    void outsiderCannotOpenConversation() {
        when(registrationClient.getChatParticipantContext(1L, "volunteer-1"))
                .thenReturn(chatContext(true, true));
        CreateConversationRequest request = new CreateConversationRequest();
        request.setEventId(1L);
        request.setVolunteerId("volunteer-1");

        assertThatThrownBy(() -> chatService.openConversation("outsider", request))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void duplicateClientMessageIdReturnsExistingMessageThroughIdempotentException() {
        ChatConversation conversation = ChatConversation.builder()
                .id(10L)
                .eventId(1L)
                .managerId("manager-1")
                .volunteerId("volunteer-1")
                .status(ChatConversationStatus.ACTIVE)
                .build();
        ChatMessage existingMessage = ChatMessage.builder()
                .id(20L)
                .conversation(conversation)
                .conversationId(10L)
                .senderId("manager-1")
                .clientMessageId("mobile-1")
                .body("hello")
                .createdAt(LocalDateTime.now())
                .build();
        when(conversationRepository.findById(10L)).thenReturn(Optional.of(conversation));
        when(messageRepository.findBySenderIdAndClientMessageId("manager-1", "mobile-1"))
                .thenReturn(Optional.of(existingMessage));

        SendMessageRequest request = new SendMessageRequest();
        request.setClientMessageId("mobile-1");
        request.setBody("hello");

        assertThatThrownBy(() -> chatService.sendMessage("manager-1", 10L, request))
                .isInstanceOf(ChatService.IdempotentMessageException.class)
                .extracting("response.id")
                .isEqualTo(20L);
        verify(messageRepository, never()).save(any());
    }

    @Test
    void canSendImageAttachmentMessageWithoutTextBody() {
        ChatConversation conversation = ChatConversation.builder()
                .id(10L)
                .eventId(1L)
                .managerId("manager-1")
                .volunteerId("volunteer-1")
                .status(ChatConversationStatus.ACTIVE)
                .build();
        when(conversationRepository.findById(10L)).thenReturn(Optional.of(conversation));
        when(messageRepository.findBySenderIdAndClientMessageId("manager-1", "mobile-image-1"))
                .thenReturn(Optional.empty());
        when(registrationClient.getChatParticipantContext(1L, "volunteer-1"))
                .thenReturn(chatContext(true, true));
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage message = invocation.getArgument(0);
            message.setId(21L);
            message.setConversationId(10L);
            message.setCreatedAt(LocalDateTime.now());
            return message;
        });
        when(conversationRepository.save(any(ChatConversation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ChatMessageAttachmentRequest attachment = new ChatMessageAttachmentRequest();
        attachment.setType("IMAGE");
        attachment.setUrl("/api/v1/chats/media/image-1.jpg");
        attachment.setMimeType("image/jpeg");
        attachment.setFileName("image-1.jpg");
        attachment.setSize(1234L);
        SendMessageRequest request = new SendMessageRequest();
        request.setClientMessageId("mobile-image-1");
        request.setAttachments(List.of(attachment));

        var response = chatService.sendMessage("manager-1", 10L, request);

        assertThat(response.getId()).isEqualTo(21L);
        assertThat(response.getBody()).isEqualTo("");
        assertThat(response.getAttachments()).hasSize(1);
        assertThat(response.getAttachments().getFirst().getType()).isEqualTo("IMAGE");
        assertThat(response.getAttachments().getFirst().getUrl()).isEqualTo("/api/v1/chats/media/image-1.jpg");
    }

    private ChatParticipantContext chatContext(boolean canSend, boolean canRead) {
        ChatParticipantContext context = new ChatParticipantContext();
        context.setEventId(1L);
        context.setManagerId("manager-1");
        context.setVolunteerId("volunteer-1");
        context.setCanSend(canSend);
        context.setCanRead(canRead);
        return context;
    }
}
