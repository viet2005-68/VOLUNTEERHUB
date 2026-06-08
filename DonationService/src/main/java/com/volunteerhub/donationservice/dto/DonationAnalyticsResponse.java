package com.volunteerhub.donationservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DonationAnalyticsResponse {
    private String managerId;
    private Long totalSucceededAmountVnd;
    private Long succeededDonationCount;
    private Long pendingAmountVnd;
    private Long pendingDonationCount;
    private Long failedDonationCount;
    private Long totalDonationCount;
}
