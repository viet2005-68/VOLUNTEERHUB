package com.volunteerhub.analyticservice.service;

import com.volunteerhub.analyticservice.dto.DashboardAnalyticsResponse;
import com.volunteerhub.common.dto.analytics.RegistrationAnalyticsSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticService {

    private final RedisTemplate<String, Object> analyticsRedisTemplate;
    private final RestClient registrationClient;
    private final RestClient eventClient;
    private final RestClient userClient;
    private final String templateAnalytic = "analytic:";

    private <T> T getCached(String ownerId, String suffix, Supplier<T> calculator) {
        String cacheScope = ownerId == null || ownerId.isBlank() ? "global" : ownerId;
        String key = templateAnalytic + cacheScope + suffix;
        Object cachedObject = analyticsRedisTemplate.opsForValue().get(key);

        if (cachedObject != null) {
            return (T) cachedObject;
        }

        try {
            T realVal = calculator.get();
            if (realVal != null) {
                analyticsRedisTemplate.opsForValue().set(key, realVal, Duration.ofMinutes(5));
            }
            return realVal;
        } catch (Exception e) {
            log.error("Error fetching analytic data for key: {}. Error: {}", key, e.getMessage());
            return null;
        }
    }

    public DashboardAnalyticsResponse getDashboard() {
        String userId = currentUserId();
        String role = currentRole();
        return getCached(userId, ":dashboard:" + role, () -> switch (role) {
            case "ADMIN" -> buildAdminDashboard();
            case "MANAGER" -> buildManagerDashboard();
            default -> buildVolunteerDashboard();
        });
    }

    public Double countMyServiceHours() {
        RegistrationAnalyticsSummary summary = fetchRegistrationSummary("/analytics/me");
        return summary == null || summary.getTotalServiceHours() == null ? 0D : summary.getTotalServiceHours();
    }

    public Long getApprovedRate() {
        return getCached(SecurityContextHolder.getContext().getAuthentication().getName()
                , ":approval_rate", () ->
                registrationClient.get()
                        .uri("/approved_rate")
                        .retrieve()
                        .body(Long.class)
        );
    }

    public Long getApplicationRate() {
        return getCached(SecurityContextHolder.getContext().getAuthentication().getName(),
                ":application_rate", () ->
                registrationClient.get()
                        .uri("/application_rate")
                        .retrieve()
                        .body(Long.class)
        );
    }

    public Map<String, Long> countStatsUserId() {
        return getCached(SecurityContextHolder.getContext().getAuthentication().getName(),
                ":countStats", () ->
                {
                    RegistrationAnalyticsSummary summary = registrationClient.get()
                        .uri("/analytics/me")
                        .retrieve()
                        .body(RegistrationAnalyticsSummary.class);
                    return summary == null || summary.getStatusBreakdown() == null
                            ? emptyRegistrationStatusMap()
                            : summary.getStatusBreakdown();
                });
    }

    public Long countMyEvents() {
        return getCached(
                SecurityContextHolder.getContext().getAuthentication().getName(),
                ":total_events_mine",
                () -> eventClient.get()
                        .uri("/stats/total-events-by-manager")
                        .retrieve()
                        .body(Long.class)
        );
    }

    public Long countActiveEvents() {
        return getCached(SecurityContextHolder.getContext().getAuthentication().getName()
                , ":total_active_events", () ->
                eventClient.get()
                        .uri("/stats/active-events-by-manager")
                        .retrieve()
                        .body(Long.class)
        );
    }

    public Long countUsers() {
        return getCached("", ":total_users", () ->
                userClient.get()
                .uri("/users/total_users")
                .retrieve()
                .body(Long.class)
        );
    }

    public Long countManagers() {
        return getCached("", ":total_managers", () ->
                userClient.get()
                        .uri("/users/total_managers")
                        .retrieve()
                        .body(Long.class)
        );
    }

    public Long countEventsPerUser() {
        return getCached(SecurityContextHolder.getContext().getAuthentication().getName()
                , ":total_events_user", () ->
                registrationClient.get()
                        .uri("/my-stats/participated-events")
                        .retrieve()
                        .body(Long.class)
        );
    }

    private DashboardAnalyticsResponse buildVolunteerDashboard() {
        RegistrationAnalyticsSummary registration = fetchRegistrationSummary("/analytics/me");
        return baseDashboard("USER", registration)
                .totalEvents(value(registration, RegistrationAnalyticsSummary::getParticipatedEvents))
                .activeEvents(value(registration, RegistrationAnalyticsSummary::getApprovedApplications))
                .pendingEvents(value(registration, RegistrationAnalyticsSummary::getPendingApplications))
                .build();
    }

    private DashboardAnalyticsResponse buildManagerDashboard() {
        RegistrationAnalyticsSummary registration = fetchRegistrationSummary("/analytics/manager");
        Map<String, Long> eventStatusBreakdown = fetchStatusMap("/stats/by-status/manager");
        return baseDashboard("MANAGER", registration)
                .totalEvents(sumValues(eventStatusBreakdown))
                .activeEvents(eventStatusBreakdown.getOrDefault("approved", 0L))
                .pendingEvents(eventStatusBreakdown.getOrDefault("pending", 0L))
                .rejectedEvents(eventStatusBreakdown.getOrDefault("rejected", 0L))
                .applicationRate(fetchLong("/application_rate", 0L))
                .eventStatusBreakdown(eventStatusBreakdown)
                .build();
    }

    private DashboardAnalyticsResponse buildAdminDashboard() {
        RegistrationAnalyticsSummary registration = fetchRegistrationSummary("/analytics/platform");
        Map<String, Long> eventStatusBreakdown = fetchStatusMap("/stats/by-status");
        return baseDashboard("ADMIN", registration)
                .totalUsers(fetchLongFrom(userClient, "/users/total_users", 0L))
                .totalManagers(fetchLongFrom(userClient, "/users/total_managers", 0L))
                .totalEvents(sumValues(eventStatusBreakdown))
                .activeEvents(eventStatusBreakdown.getOrDefault("approved", 0L))
                .pendingEvents(eventStatusBreakdown.getOrDefault("pending", 0L))
                .rejectedEvents(eventStatusBreakdown.getOrDefault("rejected", 0L))
                .eventStatusBreakdown(eventStatusBreakdown)
                .build();
    }

    private DashboardAnalyticsResponse.DashboardAnalyticsResponseBuilder baseDashboard(
            String role,
            RegistrationAnalyticsSummary registration
    ) {
        RegistrationAnalyticsSummary safeRegistration = registration == null
                ? RegistrationAnalyticsSummary.builder().build()
                : registration;

        return DashboardAnalyticsResponse.builder()
                .role(role)
                .totalApplications(value(safeRegistration, RegistrationAnalyticsSummary::getTotalApplications))
                .pendingApplications(value(safeRegistration, RegistrationAnalyticsSummary::getPendingApplications))
                .approvedApplications(value(safeRegistration, RegistrationAnalyticsSummary::getApprovedApplications))
                .completedApplications(value(safeRegistration, RegistrationAnalyticsSummary::getCompletedApplications))
                .rejectedApplications(value(safeRegistration, RegistrationAnalyticsSummary::getRejectedApplications))
                .absentApplications(value(safeRegistration, RegistrationAnalyticsSummary::getAbsentApplications))
                .participatedEvents(value(safeRegistration, RegistrationAnalyticsSummary::getParticipatedEvents))
                .uniqueVolunteers(value(safeRegistration, RegistrationAnalyticsSummary::getUniqueVolunteers))
                .thisMonthCompletedEvents(value(safeRegistration, RegistrationAnalyticsSummary::getThisMonthCompletedEvents))
                .totalServiceHours(doubleValue(safeRegistration, RegistrationAnalyticsSummary::getTotalServiceHours))
                .thisMonthServiceHours(doubleValue(safeRegistration, RegistrationAnalyticsSummary::getThisMonthServiceHours))
                .approvalRate(value(safeRegistration, RegistrationAnalyticsSummary::getApprovalRate))
                .completionRate(value(safeRegistration, RegistrationAnalyticsSummary::getCompletionRate))
                .registrationStatusBreakdown(safeRegistration.getStatusBreakdown() == null
                        ? emptyRegistrationStatusMap()
                        : safeRegistration.getStatusBreakdown())
                .monthlyTrends(safeRegistration.getMonthlyTrends() == null
                        ? java.util.Collections.emptyList()
                        : safeRegistration.getMonthlyTrends());
    }

    private RegistrationAnalyticsSummary fetchRegistrationSummary(String uri) {
        return registrationClient.get()
                .uri(uri)
                .retrieve()
                .body(RegistrationAnalyticsSummary.class);
    }

    private Map<String, Long> fetchStatusMap(String uri) {
        Map<String, Long> response = eventClient.get()
                .uri(uri)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Long>>() {});
        if (response == null) {
            return emptyStatusMap();
        }
        return response;
    }

    private Map<String, Long> emptyStatusMap() {
        Map<String, Long> map = new LinkedHashMap<>();
        map.put("pending", 0L);
        map.put("approved", 0L);
        map.put("rejected", 0L);
        return map;
    }

    private Map<String, Long> emptyRegistrationStatusMap() {
        Map<String, Long> map = new LinkedHashMap<>();
        map.put("pending", 0L);
        map.put("approved", 0L);
        map.put("rejected", 0L);
        map.put("completed", 0L);
        map.put("absent", 0L);
        return map;
    }

    private Long fetchLong(String uri, Long fallback) {
        return fetchLongFrom(registrationClient, uri, fallback);
    }

    private Long fetchLongFrom(RestClient client, String uri, Long fallback) {
        Long value = client.get()
                .uri(uri)
                .retrieve()
                .body(Long.class);
        return value == null ? fallback : value;
    }

    private Long sumValues(Map<String, Long> values) {
        if (values == null) {
            return 0L;
        }
        return values.values().stream()
                .filter(Objects::nonNull)
                .mapToLong(Long::longValue)
                .sum();
    }

    private String currentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private String currentRole() {
        if (hasRole("ADMIN")) {
            return "ADMIN";
        }
        if (hasRole("MANAGER")) {
            return "MANAGER";
        }
        return "USER";
    }

    private boolean hasRole(String role) {
        String expected = "ROLE_" + role;
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(expected::equals);
    }

    private <T> Long value(T source, java.util.function.Function<T, Long> getter) {
        if (source == null) {
            return 0L;
        }
        Long value = getter.apply(source);
        return value == null ? 0L : value;
    }

    private <T> Double doubleValue(T source, java.util.function.Function<T, Double> getter) {
        if (source == null) {
            return 0D;
        }
        Double value = getter.apply(source);
        return value == null ? 0D : value;
    }
}
