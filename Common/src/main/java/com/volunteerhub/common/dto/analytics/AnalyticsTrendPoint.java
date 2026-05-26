package com.volunteerhub.common.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsTrendPoint {
    private String month;
    private Long applications;
    private Long approved;
    private Long completed;
    private Double serviceHours;
}
