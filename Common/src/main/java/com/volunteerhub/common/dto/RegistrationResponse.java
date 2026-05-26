package com.volunteerhub.common.dto;

import com.volunteerhub.common.enums.UserEventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegistrationResponse {

    private Long id;
    private String userId;
    private Long eventId;
    private UserEventStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}