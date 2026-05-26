package com.volunteerhub.chatservice.service;

import com.volunteerhub.chatservice.dto.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatRealtimeService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastMessage(Long conversationId, String recipientId, ChatMessageResponse response) {
        messagingTemplate.convertAndSend("/topic/chats/" + conversationId, response);
        messagingTemplate.convertAndSendToUser(recipientId, "/queue/chats", response);
    }
}
