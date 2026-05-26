package com.volunteerhub.AggregationService.controller;

import com.volunteerhub.AggregationService.dto.AggregatedEventResponse;
import com.volunteerhub.AggregationService.dto.TrendingEventResponse;
import com.volunteerhub.AggregationService.service.EventAggregatorService;
import com.volunteerhub.common.dto.PageResponse;
import com.volunteerhub.common.dto.UserResponse;
import com.volunteerhub.common.enums.EventStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/aggregated/events")
public class EventAggregatorController {

    private final EventAggregatorService eventAggregatorService;

    @GetMapping
    public ResponseEntity<PageResponse<AggregatedEventResponse>> getAllAggregatedEvents(@RequestParam(required = false) Integer pageNum,
                                                                                        @RequestParam(required = false) Integer pageSize,
                                                                                        @RequestParam(required = false) EventStatus status,
                                                                                        @RequestParam(required = false) String category,
                                                                                        @RequestParam(required = false) LocalDateTime startAfter,
                                                                                        @RequestParam(required = false) LocalDateTime endBefore,
                                                                                        @RequestParam(required = false) String province,
                                                                                        @RequestParam(required = false) String district,
                                                                                        @RequestParam(required = false) String street,
                                                                                        @RequestParam(defaultValue = "id") String sortedBy,
                                                                                        @RequestParam(defaultValue = "desc") String order) {
        return ResponseEntity.ok(eventAggregatorService.getAggregatedEvents(
                pageNum, pageSize, status,
                category, startAfter, endBefore,
                province, district, street,
                sortedBy, order
        ));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<AggregatedEventResponse> getAggregatedEventById(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventAggregatorService.getAggregatedEventById(eventId));
    }

    @GetMapping("/owned")
    public ResponseEntity<PageResponse<AggregatedEventResponse>> getAllAggregatedOwnedEvents(@RequestParam(required = false) Integer pageNum,
                                                                                             @RequestParam(required = false) Integer pageSize,
                                                                                             @RequestParam(required = false) EventStatus status,
                                                                                             @RequestParam(required = false) String category,
                                                                                             @RequestParam(required = false) LocalDateTime startAfter,
                                                                                             @RequestParam(required = false) LocalDateTime endBefore,
                                                                                             @RequestParam(required = false) String province,
                                                                                             @RequestParam(required = false) String district,
                                                                                             @RequestParam(required = false) String street,
                                                                                             @RequestParam(defaultValue = "id") String sortedBy,
                                                                                             @RequestParam(defaultValue = "desc") String order) {
        return ResponseEntity.ok(eventAggregatorService.getAggregatedOwnedEvents(
                pageNum, pageSize, status,
                category, startAfter, endBefore,
                province, district, street,
                sortedBy, order
        ));
    }

    @GetMapping("/owned/search")
    public ResponseEntity<PageResponse<AggregatedEventResponse>> searchAggregatedOwnedEvents(@RequestParam("keyword") String keyword,
                                                                                             @RequestParam(required = false) EventStatus status,
                                                                                             @RequestParam(required = false) Integer pageNum,
                                                                                             @RequestParam(required = false) Integer pageSize) {
        return ResponseEntity.ok(eventAggregatorService.searchAggregatedOwnedEvents(keyword, status, pageNum, pageSize));
    }

    // TODO: pagination metadata, total comments, posts, reaction, maybe need standalone service for trending computing
    @GetMapping("/trending")
    public ResponseEntity<PageResponse<TrendingEventResponse>> getAllTrendingEvents(
            @RequestParam(defaultValue = "0") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "7") int days) {

        PageResponse<TrendingEventResponse> response = eventAggregatorService.getTrendingEvents(pageNum, pageSize, days);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<AggregatedEventResponse>> searchEvents(
            @RequestParam String keyword,
            @RequestParam(required = false) EventStatus status,
            @RequestParam(required = false) Integer pageNum,
            @RequestParam(required = false) Integer pageSize) {

        return ResponseEntity.ok(eventAggregatorService.searchAggregatedEvents(keyword, status, pageNum, pageSize));
    }

    @GetMapping("/{eventId}/users")
    public ResponseEntity<List<UserResponse>> getUsers(@PathVariable Long eventId,
                                                          @RequestParam(required = false) Integer pageNum,
                                                          @RequestParam(required = false) Integer pageSize) {
        return ResponseEntity.ok(eventAggregatorService.getEventUsers(eventId, pageNum, pageSize));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportEvents(@RequestParam(defaultValue = "csv") String format) {
        byte[] data = eventAggregatorService.exportAllEvents(format);

        String extension = "json".equalsIgnoreCase(format) ? ".json" : ".csv";
        MediaType mediaType = "json".equalsIgnoreCase(format)
                ? MediaType.APPLICATION_JSON
                : MediaType.parseMediaType("text/csv");

        String fileName = "all_events_report_" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmm")) + extension;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(mediaType)
                .body(data);
    }
}
