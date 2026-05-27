package com.volunteerhub.registrationservice.controller;

import com.volunteerhub.common.dto.*;
import com.volunteerhub.common.dto.analytics.RegistrationAnalyticsSummary;
import com.volunteerhub.common.utils.ExportUtils;
import com.volunteerhub.common.enums.UserEventStatus;
import com.volunteerhub.registrationservice.dto.UserEventExport;
import com.volunteerhub.registrationservice.dto.UserEventRequest;
import com.volunteerhub.common.dto.UserEventResponse;
import com.volunteerhub.registrationservice.service.UserEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
public class UserEventController {

    private final UserEventService userEventService;

    @GetMapping
    public ResponseEntity<Page<UserEventResponse>> findAllByUserId(@RequestParam(required = false) UserEventStatus status,
                                                                   @RequestParam(required = false) Integer pageNum,
                                                                   @RequestParam(required = false) Integer pageSize) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userEventService.findByUserId(authentication.getName(), status, pageNum, pageSize));
    }


    @GetMapping("/events/{eventId}/user-ids")
    public ResponseEntity<List<String>> findUserIdsByEventId(@PathVariable Long eventId,
                                                             @RequestParam(required = false) UserEventStatus status,
                                                             @RequestParam(required = false) Integer pageNum,
                                                             @RequestParam(required = false) Integer pageSize) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userEventService.findUserIdsByEventId(authentication.getName(), eventId, pageNum, pageSize));
    }

    @GetMapping("/events/{eventId}/participants")
    public ResponseEntity<Page<UserEventResponse>> findAllParticipants(@PathVariable Long eventId,
                                                                       @RequestParam(required = false) Integer pageNum,
                                                                       @RequestParam(required = false) Integer pageSize) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userEventService.findAllUsers(authentication.getName(), eventId, pageNum, pageSize));
    }

    @GetMapping("/events/{eventId}/isParticipant")
    public Boolean checkIsParticipant(@PathVariable Long eventId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userEventService.isParticipant(authentication.getName(), eventId);
    }

    @GetMapping("/events/{eventId}/status")
    public ResponseEntity<UserEventStatus> getStatus(@PathVariable Long eventId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userEventService.getRegistrationStatus(authentication.getName(), eventId));
    }


    @GetMapping("/events/{eventId}")
    public ResponseEntity<Page<UserEventResponse>> findAllByEventId(@PathVariable Long eventId,
                                                                    @RequestParam(required = false) UserEventStatus status,
                                                                    @RequestParam(required = false) Integer pageNum,
                                                                    @RequestParam(required = false) Integer pageSize) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userEventService.findByEventId(authentication.getName(), eventId, status, pageNum, pageSize));
    }

    @GetMapping("/events/registration-count")
    public ResponseEntity<PageResponse<EventRegistrationCount>> getEventsParticipantCounts(
            @RequestParam(required = false) List<Long> eventIds,
            @RequestParam(required = false) Integer pageNum,
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(required = false) Integer days) {

        if (eventIds != null && !eventIds.isEmpty()) {
            List<EventRegistrationCount> list = userEventService.getEventsParticipantCount(eventIds);

            PageResponse<EventRegistrationCount> response = PageResponse.<EventRegistrationCount>builder()
                    .content(list)
                    .totalElements((long) list.size())
                    .totalPages(1)
                    .number(0)
                    .size(list.size())
                    .build();
            return ResponseEntity.ok(response);
        }

        LocalDateTime to = days == null ? null : LocalDateTime.now();
        LocalDateTime from = days == null ? null : to.minusDays(days);

        return ResponseEntity.ok(userEventService.getAllEventsParticipantCount(pageNum, pageSize, from, to));
    }

    @PostMapping("/events/{eventId}")
    public ResponseEntity<UserEventResponse> userEventRegister(@PathVariable Long eventId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(userEventService.registerUserEvent(authentication.getName(), eventId), HttpStatus.CREATED);
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<UserEventResponse> deleteUserEventRegister(@PathVariable Long eventId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userEventService.deleteUserEventRegistrationRequest(authentication.getName(), eventId));
    }

    @DeleteMapping("/events/{eventId}/participants/{participantId}")
    public ResponseEntity<UserEventResponse> managerDeleteUserEventRegister(@PathVariable Long eventId,
                                                                            @PathVariable String participantId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userEventService.managerDeleteUserEventRegistrationRequest(authentication.getName(), participantId, eventId));
    }

    @PutMapping("/events/{eventId}/participants/{participantId}")
    public ResponseEntity<UserEventResponse> reviewUserEventRegistration(@PathVariable Long eventId,
                                                                         @PathVariable String participantId,
                                                                         @RequestBody UserEventRequest userEventRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userEventService.reviewUserEventRegistrationRequest(
                authentication.getName(),
                participantId,
                eventId,
                userEventRequest)
        );
    }

    @GetMapping("/internal/manager")
    public ResponseEntity<List<RegistrationResponse>> getRegistrationsByOwnerId(
            @RequestParam(value = "eventId", required = false) Long eventId,
            @RequestParam(required = false) UserEventStatus status,
            @RequestParam(defaultValue = "0") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String ownerId = authentication.getName();
        return ResponseEntity.ok(userEventService.getRegistrationsByEventIdsInternal(ownerId, eventId, status, pageNum, pageSize));
    }

    @GetMapping("/internal/owner-volunteer-counts")
    public ResponseEntity<Map<String, Long>> countUniqueVolunteersByOwnerIds(@RequestParam List<String> ownerIds) {
        return ResponseEntity.ok(userEventService.countUniqueVolunteersByOwnerIds(ownerIds));
    }

    @GetMapping("/application_rate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Long> getApplicationRate() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        return ResponseEntity.ok(userEventService.getApplicationRate(currentUserId));
    }

    @GetMapping("/approved_rate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Long> getApprovedRate() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();
        return ResponseEntity.ok(userEventService.getApprovalRate(currentUserId));
    }

    @GetMapping("/export-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserEventExport>> exportAllRegistrations() {
        return ResponseEntity.ok(userEventService.getAllForExport());
    }

    @GetMapping("/event/{eventId}/export")
    public ResponseEntity<byte[]> exportParticipants(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "csv") String format) {

        List<UserEventExport> data = userEventService.getByEventForExport(eventId);

        byte[] content;
        String fileName = "participants_event_" + eventId;
        MediaType contentType;

        if ("json".equalsIgnoreCase(format)) {
            content = ExportUtils.toJson(data);
            fileName += ".json";
            contentType = MediaType.APPLICATION_JSON;
        } else {
            String[] headers = {"ID", "Event ID", "User ID", "Status", "Note", "Registered At"};

            content = ExportUtils.toCsv(headers, data, item -> new Object[] {
                    item.getId(),
                    item.getEventId(),
                    item.getUserId(),
                    item.getStatus(),
                    item.getNote() != null ? item.getNote() : "",
                    item.getRegisteredAt()
            });
            fileName += ".csv";
            contentType = MediaType.parseMediaType("text/csv");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(contentType)
                .body(content);
    }

    @GetMapping("/my-stats/participated-events")
    public ResponseEntity<Long> getMyTotalParticipatedEvents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userEventService.countParticipatedEvents(authentication.getName()));
    }

    @GetMapping("/my-stats/status-events")
    public ResponseEntity<Map<String, Long>> countStatsUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userEventService.countStatsUserId(authentication.getName()));
    }

    @GetMapping("/analytics/me")
    public ResponseEntity<RegistrationAnalyticsSummary> getMyRegistrationAnalytics() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userEventService.getMyAnalytics(authentication.getName()));
    }

    @GetMapping("/analytics/manager")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<RegistrationAnalyticsSummary> getManagerRegistrationAnalytics() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userEventService.getManagerAnalytics(authentication.getName()));
    }

    @GetMapping("/analytics/platform")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegistrationAnalyticsSummary> getPlatformRegistrationAnalytics() {
        return ResponseEntity.ok(userEventService.getPlatformAnalytics());
    }
}
