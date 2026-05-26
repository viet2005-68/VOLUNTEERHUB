package com.volunteerhub.registrationservice.controller;

import com.volunteerhub.registrationservice.dto.ChatParticipantContext;
import com.volunteerhub.registrationservice.service.UserEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
public class SystemController {

    private final UserEventService userEventService;

    @GetMapping("/events/{eventId}/participant-ids")
    public List<String> findAllUserIdsByEventId(@PathVariable Long eventId) {
        return userEventService.findUserIdsByEventId(eventId);
    }

    @GetMapping("/internal/events/{eventId}/chat-context")
    public ChatParticipantContext getChatParticipantContext(@PathVariable Long eventId,
                                                            @RequestParam String volunteerId) {
        return userEventService.getChatParticipantContext(eventId, volunteerId);
    }
}
