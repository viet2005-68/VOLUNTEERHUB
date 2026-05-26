package com.volunteerhub.registrationservice.dto;

import com.volunteerhub.registrationservice.model.QrCodeStatus;
import com.volunteerhub.registrationservice.model.QrCodePurpose;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class QrCodeResponse {

    private Long id;
    private Long eventId;
    private String token;
    private String qrPayload;
    private QrCodePurpose purpose;
    private QrCodeStatus status;
    private LocalDateTime expiresAt;
    private Integer maxUses;
    private Integer useCount;
    private LocalDateTime createdAt;
}
