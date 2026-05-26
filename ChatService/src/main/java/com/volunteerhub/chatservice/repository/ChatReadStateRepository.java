package com.volunteerhub.chatservice.repository;

import com.volunteerhub.chatservice.model.ChatReadState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatReadStateRepository extends JpaRepository<ChatReadState, Long> {

    Optional<ChatReadState> findByConversationIdAndUserId(Long conversationId, String userId);
}
