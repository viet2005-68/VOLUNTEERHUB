package com.volunteerhub.common.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationAnalyticsSummary {
    private Long totalApplications;
    private Long pendingApplications;
    private Long approvedApplications;
    private Long completedApplications;
    private Long rejectedApplications;
    private Long absentApplications;
    private Long participatedEvents;
    private Long uniqueVolunteers;
    private Long thisMonthCompletedEvents;
    private Double totalServiceHours;
    private Double thisMonthServiceHours;
    private Long approvalRate;
    private Long completionRate;
    private Map<String, Long> statusBreakdown;
    private List<AnalyticsTrendPoint> monthlyTrends;
}
