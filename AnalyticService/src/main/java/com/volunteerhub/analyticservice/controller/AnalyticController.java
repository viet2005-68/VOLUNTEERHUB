package com.volunteerhub.analyticservice.controller;

import com.volunteerhub.analyticservice.dto.DashboardAnalyticsResponse;
import com.volunteerhub.analyticservice.service.AnalyticService;
import com.volunteerhub.analyticservice.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticController {

    private final AnalyticService analyticService;
    private final ReportService reportService;

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    @GetMapping("/total_events")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Long> countEventsPerManager() {
        return ResponseEntity.ok(analyticService.countMyEvents());
    }

    @GetMapping("/total-active-events")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Long> countActiveEventsPerManager() {
        return ResponseEntity.ok(analyticService.countActiveEvents());
    }

    @GetMapping("/application-rate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Long> getApplicationRate() {
        return ResponseEntity.ok(analyticService.getApplicationRate());
    }

    @GetMapping("/approval-rate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Long> getApprovalRate() {
        return ResponseEntity.ok(analyticService.getApprovedRate());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAnalyticsResponse> getDashboardAnalytics() {
        return ResponseEntity.ok(analyticService.getDashboard());
    }

//    @GetMapping("/{ownerId}/dashboard")
//    @PreAuthorize("#ownerId == authentication.name or hasRole('MANAGER')")
//    public ResponseEntity<Map<String, Long>> getOwnerDashboard(@PathVariable String ownerId) {
//        Map<String, Long> stats = new HashMap<>();
//        stats.put("applicationRate", analyticService.getApplicationRate(ownerId));
//        stats.put("approvalRate", analyticService.getApprovedRate(ownerId));
//        return ResponseEntity.ok(stats);
//    }

    @GetMapping("/count-active-events")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Long> countActiveEvents() {
        return ResponseEntity.ok(analyticService.countActiveEvents());
    }

    @GetMapping("/total-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> countUsers() {
        return ResponseEntity.ok(analyticService.countUsers());
    }

    @GetMapping("/total-managers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> countManagers() {
        return ResponseEntity.ok(analyticService.countManagers());
    }

    @GetMapping("/my-stats/participated-events")
    public ResponseEntity<Long> countEventsPerUser() {
        return ResponseEntity.ok(analyticService.countEventsPerUser());
    }

    @GetMapping("/my-stats/community-service-hours")
    public ResponseEntity<Double> countMyServiceHours() {
        return ResponseEntity.ok(analyticService.countMyServiceHours());
    }

    @GetMapping("/my-stats/count-reqs")
    public ResponseEntity<Map<String, Long>> countStatsUserId() {
        return ResponseEntity.ok(analyticService.countStatsUserId());
    }

    @PostMapping("/export/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InputStreamResource> exportUsers(@RequestBody(required = false) List<String> ids) {
        ByteArrayInputStream in = reportService.exportUsers(ids);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=users.csv");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/export/events")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<InputStreamResource> exportEvents() {
        ByteArrayInputStream in = reportService.exportEvents();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=events.csv");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/export/registrations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<InputStreamResource> exportRegistrations(@RequestParam(required = false) Long eventId) {
        ByteArrayInputStream in = reportService.exportRegistrations(eventId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=registrations.csv");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(new InputStreamResource(in));
    }
}
