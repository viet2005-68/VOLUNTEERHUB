package com.volunteerhub.common.dto.message.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDeletedMessage implements UserMessage {
    private UUID userId;
    private LocalDateTime deletedAt;
}