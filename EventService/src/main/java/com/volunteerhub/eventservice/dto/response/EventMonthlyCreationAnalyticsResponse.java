package com.volunteerhub.eventservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventMonthlyCreationAnalyticsResponse {
    private String month;
    private Long pending;
    private Long approved;
    private Long rejected;
    private Long total;
}
