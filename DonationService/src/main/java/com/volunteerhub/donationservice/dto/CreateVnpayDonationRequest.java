package com.volunteerhub.donationservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateVnpayDonationRequest {

    @NotBlank
    private String managerId;

    @NotBlank
    @Size(max = 80)
    private String clientDonationId;

    @NotNull
    @Min(1000)
    private Long amountVnd;

    @Size(max = 500)
    private String message;

    @Size(max = 20)
    private String bankCode;
}
