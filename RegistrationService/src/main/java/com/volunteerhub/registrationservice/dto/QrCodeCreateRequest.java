package com.volunteerhub.registrationservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QrCodeCreateRequest {

    private LocalDateTime expiresAt;
    private Integer maxUses;
}
