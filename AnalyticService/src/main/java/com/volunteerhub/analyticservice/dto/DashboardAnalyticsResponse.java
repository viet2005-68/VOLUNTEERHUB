package com.volunteerhub.analyticservice.dto;

import com.volunteerhub.common.dto.analytics.AnalyticsTrendPoint;
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
public class DashboardAnalyticsResponse {
    private String role;
    private Long totalUsers;
    private Long totalManagers;
    private Long totalEvents;
    private Long activeEvents;
    private Long pendingEvents;
    private Long rejectedEvents;
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
    private Long applicationRate;
    private Long approvalRate;
    private Long completionRate;
    private Map<String, Long> eventStatusBreakdown;
    private Map<String, Long> registrationStatusBreakdown;
    private List<AnalyticsTrendPoint> monthlyTrends;
}
