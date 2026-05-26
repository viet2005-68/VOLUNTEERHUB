package com.volunteerhub.chatservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateConversationRequest {

    @NotNull
    private Long eventId;

    private String volunteerId;
}
