package com.volunteerhub.donationservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EventDonationSummaryResponse {
    private Long eventId;
    private Long totalSucceededAmountVnd;
    private Long succeededDonationCount;
}
