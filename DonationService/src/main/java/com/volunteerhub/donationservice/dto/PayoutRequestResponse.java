package com.volunteerhub.donationservice.dto;

import com.volunteerhub.donationservice.model.PayoutStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PayoutRequestResponse {
    private Long id;
    private String managerId;
    private Long amountVnd;
    private String momoWalletPhone;
    private String walletHolderName;
    private PayoutStatus status;
    private String note;
    private String adminNote;
    private String providerReference;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}
