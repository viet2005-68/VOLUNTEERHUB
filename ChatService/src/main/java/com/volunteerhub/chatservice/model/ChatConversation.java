package com.volunteerhub.chatservice.model;

import com.volunteerhub.common.enums.ChatConversationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
                @Index(name = "idx_chat_conversation_event_id", columnList = "event_id"),
                @Index(name = "idx_chat_conversation_manager_id", columnList = "manager_id"),
                @Index(name = "idx_chat_conversation_volunteer_id", columnList = "volunteer_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_chat_conversation_event_manager_volunteer", columnNames = {"event_id", "manager_id", "volunteer_id"})
        }
)
public class ChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "manager_id", nullable = false)
    private String managerId;

    @Column(name = "volunteer_id", nullable = false)
    private String volunteerId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatConversationStatus status = ChatConversationStatus.ACTIVE;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Builder.Default
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
