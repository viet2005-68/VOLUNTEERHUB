package com.volunteerhub.common.dto.message.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDeactivatedMessage implements UserMessage {
    private UUID userId;
    private String reason;
    private LocalDateTime deactivatedAt;
}