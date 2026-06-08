package com.volunteerhub.donationservice.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewPayoutRequest {

    @Size(max = 120)
    private String providerReference;

    @Size(max = 500)
    private String adminNote;
}
