package com.volunteerhub.chatservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(indexes = {
        @Index(name = "idx_chat_message_attachment_message_id", columnList = "message_id")
})
public class ChatMessageAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    @JsonIgnore
    private ChatMessage message;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, length = 1024)
    private String url;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(nullable = false)
    private Long size;

    @Column(name = "storage_key", nullable = false, length = 1024)
    private String storageKey;
}
