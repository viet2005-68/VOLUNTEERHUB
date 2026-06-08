package com.volunteerhub.donationservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ManagerBalanceResponse {
    private String managerId;
    private Long totalReceivedVnd;
    private Long pendingPayoutVnd;
    private Long paidOutVnd;
    private Long availableVnd;
}
