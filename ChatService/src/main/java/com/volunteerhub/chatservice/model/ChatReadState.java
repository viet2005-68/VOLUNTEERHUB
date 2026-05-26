package com.volunteerhub.chatservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_chat_read_state_conversation_user", columnNames = {"conversation_id", "user_id"})
        }
)
public class ChatReadState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false)
    private Long conversationId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;

    @Column(name = "last_read_message_id")
    private Long lastReadMessageId;
}
