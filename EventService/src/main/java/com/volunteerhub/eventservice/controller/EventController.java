package com.volunteerhub.eventservice.controller;

import com.volunteerhub.common.dto.EventResponse;
import com.volunteerhub.common.dto.EventResponseCSV;
import com.volunteerhub.eventservice.dto.request.EventRequest;
import com.volunteerhub.eventservice.dto.request.RejectRequest;
import com.volunteerhub.eventservice.service.EventService;
import com.volunteerhub.eventservice.validation.OnCreate;
import com.volunteerhub.eventservice.validation.OnUpdate;
import com.volunteerhub.common.enums.EventStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<Page<EventResponse>> getAllEvents(@RequestParam(required = false) Integer pageNum,
                                                            @RequestParam(required = false) Integer pageSize,
                                                            @RequestParam(required = false) EventStatus status,
                                                            @RequestParam(required = false) String category,
                                                            @RequestParam(required = false) LocalDateTime startAfter,
                                                            @RequestParam(required = false) LocalDateTime endBefore,
                                                            @RequestParam(required = false) String province,
                                                            @RequestParam(required = false) String district,
                                                            @RequestParam(required = false) String street,
                                                            @RequestParam(defaultValue = "id") String sortedBy,
                                                            @RequestParam(defaultValue = "desc") String order)  {
        return ResponseEntity.ok(eventService.findAll(
                pageNum, pageSize, status, category,
                startAfter, endBefore, province, district,
                street, sortedBy, order));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.findById(eventId));
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@RequestPart @Validated(OnCreate.class) EventRequest eventRequest,
                                                     @RequestPart(required = false) MultipartFile imageFile) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(eventService.createEvent(auth.getName(), eventRequest, imageFile), HttpStatus.CREATED);
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Long eventId,
                                                     @RequestPart @Validated(OnUpdate.class) EventRequest eventRequest,
                                                     @RequestPart(required = false) MultipartFile imageFile) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(eventService.updateEvent(auth.getName(), eventId, eventRequest, imageFile));
    }


    @PutMapping("/{eventId}/approve")
    public ResponseEntity<EventResponse> approveEvent(@PathVariable Long eventId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(eventService.approveEvent(auth.getName(), eventId));
    }

    @PutMapping("/{eventId}/reject")
    public ResponseEntity<EventResponse> rejectEvent(@PathVariable Long eventId,
                                                     @RequestBody RejectRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(eventService.rejectEvent(authentication.getName(), eventId, request));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<EventResponse> deleteEvent(@PathVariable Long eventId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(eventService.deleteEvent(auth.getName(), eventId));
    }
}
