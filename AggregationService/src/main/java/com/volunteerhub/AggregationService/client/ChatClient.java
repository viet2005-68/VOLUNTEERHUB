package com.volunteerhub.AggregationService.client;

import com.volunteerhub.AggregationService.config.FeignConfig;
import com.volunteerhub.AggregationService.dto.ChatConversationResponse;
import com.volunteerhub.AggregationService.dto.ChatMessageResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.util.List;

@FeignClient(name = "CHATSERVICE", path = "/api/v1/chats", configuration = FeignConfig.class)
public interface ChatClient {

    @GetMapping("/conversations")
    List<ChatConversationResponse> listConversations(@RequestParam(required = false) Long eventId);

    @GetMapping("/conversations/{conversationId}/messages")
    List<ChatMessageResponse> listMessages(@PathVariable Long conversationId,
                                            @RequestParam(required = false)
                                            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                            LocalDateTime before,
                                            @RequestParam(required = false) Integer limit);
}
