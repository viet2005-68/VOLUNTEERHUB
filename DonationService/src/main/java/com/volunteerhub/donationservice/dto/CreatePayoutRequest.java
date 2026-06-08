package com.volunteerhub.donationservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePayoutRequest {

    @NotNull
    @Min(10000)
    private Long amountVnd;

    @NotBlank
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "MoMo wallet phone must be a valid Vietnam phone number.")
    private String momoWalletPhone;

    @NotBlank
    @Size(max = 120)
    private String walletHolderName;

    @Size(max = 500)
    private String note;
}
