package com.volunteerhub.donationservice.dto;

import com.volunteerhub.donationservice.model.DonationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DonationResponse {
    private Long id;
    private String donorId;
    private String managerId;
    private String clientDonationId;
    private Long amountVnd;
    private String provider;
    private String providerOrderId;
    private String providerTransactionId;
    private DonationStatus status;
    private String message;
    private LocalDateTime settledAt;
    private LocalDateTime createdAt;
}
