package com.volunteerhub.eventservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventAnalyticsSummaryResponse {
    private Long totalEvents;
    private Long pendingEvents;
    private Long approvedEvents;
    private Long rejectedEvents;
    private Long totalCapacity;
}
