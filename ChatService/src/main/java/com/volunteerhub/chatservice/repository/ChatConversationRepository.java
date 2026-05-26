package com.volunteerhub.chatservice.repository;

import com.volunteerhub.chatservice.model.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {

    Optional<ChatConversation> findByEventIdAndManagerIdAndVolunteerId(Long eventId, String managerId, String volunteerId);

    List<ChatConversation> findByManagerIdOrVolunteerIdOrderByLastMessageAtDesc(String managerId, String volunteerId);
}
