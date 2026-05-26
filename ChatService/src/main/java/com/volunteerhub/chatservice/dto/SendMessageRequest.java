package com.volunteerhub.chatservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class SendMessageRequest {

    private String body;

    @NotBlank
    private String clientMessageId;

    @Valid
    @Size(max = 5)
    private List<ChatMessageAttachmentRequest> attachments;
}
