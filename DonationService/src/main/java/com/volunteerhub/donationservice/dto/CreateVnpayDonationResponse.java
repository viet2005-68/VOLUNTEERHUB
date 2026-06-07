package com.volunteerhub.donationservice.dto;

import com.volunteerhub.donationservice.model.DonationStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateVnpayDonationResponse {
    private Long donationId;
    private String orderId;
    private Long amountVnd;
    private DonationStatus status;
    private String paymentUrl;
}
