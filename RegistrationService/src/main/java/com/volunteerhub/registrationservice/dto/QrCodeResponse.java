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
    private String label;
    private String note;
    private Integer useCount;
    private LocalDateTime revokedAt;
    private String revokedBy;
    private String revokeReason;
    private LocalDateTime createdAt;
}
