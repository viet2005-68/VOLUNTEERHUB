package com.volunteerhub.AggregationService.controller;

import com.volunteerhub.AggregationService.dto.AggregatedChatConversationResponse;
import com.volunteerhub.AggregationService.dto.AggregatedChatMessageResponse;
import com.volunteerhub.AggregationService.service.ChatAggregatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/aggregated/chats")
public class ChatAggregatorController {

    private final ChatAggregatorService chatAggregatorService;

    @GetMapping("/conversations")
    public ResponseEntity<List<AggregatedChatConversationResponse>> listConversations(
            @RequestParam(required = false) Long eventId) {
        return ResponseEntity.ok(chatAggregatorService.listConversations(eventId));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<AggregatedChatMessageResponse>> listMessages(
            @PathVariable Long conversationId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime before,
            @RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(chatAggregatorService.listMessages(conversationId, before, limit));
    }
}
