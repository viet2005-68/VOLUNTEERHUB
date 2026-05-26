package com.volunteerhub.chatservice.client;

import com.volunteerhub.chatservice.config.FeignConfig;
import com.volunteerhub.chatservice.dto.ChatParticipantContext;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "REGISTRATIONSERVICE", path = "/api/v1/registrations", configuration = FeignConfig.class)
public interface RegistrationClient {

    @GetMapping("/internal/events/{eventId}/chat-context")
    ChatParticipantContext getChatParticipantContext(@PathVariable Long eventId,
                                                     @RequestParam String volunteerId);
}
