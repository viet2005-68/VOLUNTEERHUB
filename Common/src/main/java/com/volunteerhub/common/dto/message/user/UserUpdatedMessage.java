package com.volunteerhub.common.dto.message.user;

import com.volunteerhub.common.enums.UserRole;
import com.volunteerhub.common.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdatedMessage implements UserMessage {
    private UUID userId;
    private String email;
    private UserRole role;
    private LocalDateTime updatedAt;
    private UserStatus status;
    private UUID adminId;
}
