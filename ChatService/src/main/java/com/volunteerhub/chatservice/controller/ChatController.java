package com.volunteerhub.chatservice.controller;

import com.volunteerhub.chatservice.dto.ChatConversationResponse;
import com.volunteerhub.chatservice.dto.ChatMediaUploadResponse;
import com.volunteerhub.chatservice.dto.ChatMessageResponse;
import com.volunteerhub.chatservice.dto.CreateConversationRequest;
import com.volunteerhub.chatservice.dto.MarkReadRequest;
import com.volunteerhub.chatservice.dto.SendMessageRequest;
import com.volunteerhub.chatservice.service.ChatMediaStorageService;
import com.volunteerhub.chatservice.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatMediaStorageService chatMediaStorageService;

    @PostMapping("/conversations")
    public ChatConversationResponse openConversation(@Valid @RequestBody CreateConversationRequest request) {
        return chatService.openConversation(currentUserId(), request);
    }

    @GetMapping("/conversations")
    public List<ChatConversationResponse> listConversations() {
        return chatService.listConversations(currentUserId());
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public List<ChatMessageResponse> listMessages(@PathVariable Long conversationId,
                                                  @RequestParam(required = false)
                                                  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                                  LocalDateTime before,
                                                  @RequestParam(required = false) Integer limit) {
        return chatService.listMessages(currentUserId(), conversationId, before, limit);
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ChatMessageResponse sendMessage(@PathVariable Long conversationId,
                                           @Valid @RequestBody SendMessageRequest request) {
        return chatService.sendMessage(currentUserId(), conversationId, request);
    }

    @PostMapping("/media")
    public ChatMediaUploadResponse uploadImage(@RequestParam("file") MultipartFile file) {
        return chatMediaStorageService.storeImage(file);
    }

    @PutMapping("/conversations/{conversationId}/read")
    public ChatConversationResponse markRead(@PathVariable Long conversationId,
                                             @RequestBody(required = false) MarkReadRequest request) {
        return chatService.markRead(currentUserId(), conversationId, request);
    }

    private String currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
