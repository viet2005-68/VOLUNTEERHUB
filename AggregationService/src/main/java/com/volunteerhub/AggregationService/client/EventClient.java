package com.volunteerhub.AggregationService.client;

import com.volunteerhub.AggregationService.config.FeignConfig;
import com.volunteerhub.common.dto.EventResponse;
import com.volunteerhub.common.dto.PageResponse;
import com.volunteerhub.common.enums.EventStatus;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.util.List;

@FeignClient(name = "EVENTSERVICE", path = "/api/v1/events", configuration = FeignConfig.class)
public interface EventClient {

    @GetMapping
    PageResponse<EventResponse> getAllEvents(@RequestParam(required = false) Integer pageNum,
                                             @RequestParam(required = false) Integer pageSize,
                                             @RequestParam(required = false) EventStatus status,
                                             @RequestParam(required = false) String category,
                                             @RequestParam(required = false) LocalDateTime startAfter,
                                             @RequestParam(required = false) LocalDateTime endBefore,
                                             @RequestParam(required = false) String province,
                                             @RequestParam(required = false) String district,
                                             @RequestParam(required = false) String street,
                                             @RequestParam(defaultValue = "id") String sortedBy,
                                             @RequestParam(defaultValue = "desc") String order);

    @GetMapping("/owned")
    PageResponse<EventResponse> getAllOwnedEvents(@RequestParam(required = false) Integer pageNum,
                                                  @RequestParam(required = false) Integer pageSize,
                                                  @RequestParam(required = false) EventStatus status,
                                                  @RequestParam(required = false) String category,
                                                  @RequestParam(required = false) LocalDateTime startAfter,
                                                  @RequestParam(required = false) LocalDateTime endBefore,
                                                  @RequestParam(required = false) String province,
                                                  @RequestParam(required = false) String district,
                                                  @RequestParam(required = false) String street,
                                                  @RequestParam(defaultValue = "id") String sortedBy,
                                                  @RequestParam(defaultValue = "desc") String order);

    @GetMapping("/{eventId}")
    EventResponse getEventById(@PathVariable Long eventId);

    @GetMapping("/by-ids")
    List<EventResponse> getAllEventsByIds(@RequestParam List<Long> eventIds);

    @GetMapping("/search")
    PageResponse<EventResponse> searchEvents(@RequestParam("keyword") String keyword,
                                             @RequestParam(required = false) EventStatus status,
                                             @RequestParam(value = "pageNum", required = false) Integer pageNum,
                                             @RequestParam(value = "pageSize", required = false) Integer pageSize);

    @GetMapping("/owned/search")
    PageResponse<EventResponse> searchOwnedEvents(@RequestParam("keyword") String keyword,
                                                  @RequestParam(required = false) EventStatus status,
                                                  @RequestParam(required = false) Integer pageNum,
                                                  @RequestParam(required = false) Integer pageSize);
}
