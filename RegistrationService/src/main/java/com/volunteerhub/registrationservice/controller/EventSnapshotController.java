package com.volunteerhub.registrationservice.controller;

import com.volunteerhub.registrationservice.service.EventSnapshotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/event_snapshot")
@RequiredArgsConstructor
public class EventSnapshotController {
    private final EventSnapshotService eventSnapshotService;

    @GetMapping("/{ownerId}/total_events_each")
    @PreAuthorize("MANAGER")
    public ResponseEntity<Long> countEventsPerManager(@PathVariable String ownerId) {
        return ResponseEntity.ok(eventSnapshotService.countEventPerManager(ownerId));
    }

    @GetMapping("/{ownerId}/current_active_events_each")
    @PreAuthorize("MANAGER")
    public ResponseEntity<Long> countActiveEventsPerManager(@PathVariable String ownerId) {
        return ResponseEntity.ok(eventSnapshotService.countEventActivePerManager(ownerId));
    }
}
