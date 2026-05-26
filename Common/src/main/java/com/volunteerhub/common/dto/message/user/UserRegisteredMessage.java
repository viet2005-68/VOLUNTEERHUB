package com.volunteerhub.common.dto.message.user;

import com.volunteerhub.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisteredMessage implements UserMessage {
    private UUID userId;
    private String email;
    private UserRole role;
    private LocalDateTime createdAt;
}