package com.volunteerhub.chatservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(
        indexes = {
                @Index(name = "idx_chat_message_conversation_id", columnList = "conversation_id"),
                @Index(name = "idx_chat_message_created_at", columnList = "created_at")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_chat_message_sender_client_id", columnNames = {"sender_id", "client_message_id"})
        }
)
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    @JsonIgnore
    private ChatConversation conversation;

    @Column(name = "conversation_id", insertable = false, updatable = false)
    private Long conversationId;

    @Column(name = "sender_id", nullable = false)
    private String senderId;

    @Column(name = "client_message_id", nullable = false)
    private String clientMessageId;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Builder.Default
    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessageAttachment> attachments = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
