package com.volunteerhub.chatservice.dto;

import lombok.Data;

@Data
public class MarkReadRequest {

    private Long lastReadMessageId;
}
