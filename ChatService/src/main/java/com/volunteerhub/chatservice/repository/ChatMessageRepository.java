package com.volunteerhub.chatservice.repository;

import com.volunteerhub.chatservice.model.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Optional<ChatMessage> findBySenderIdAndClientMessageId(String senderId, String clientMessageId);

    List<ChatMessage> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    List<ChatMessage> findByConversationIdAndCreatedAtBeforeOrderByCreatedAtDesc(Long conversationId,
                                                                                 LocalDateTime before,
                                                                                 Pageable pageable);

    Long countByConversationIdAndSenderIdNot(Long conversationId, String userId);

    Long countByConversationIdAndSenderIdNotAndCreatedAtAfter(Long conversationId,
                                                              String userId,
                                                              LocalDateTime after);
}
