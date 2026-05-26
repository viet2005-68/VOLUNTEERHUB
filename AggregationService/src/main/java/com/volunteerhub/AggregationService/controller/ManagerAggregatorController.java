package com.volunteerhub.AggregationService.controller;

import com.volunteerhub.AggregationService.dto.ManagerRegistrationResponse;
import com.volunteerhub.AggregationService.service.ManagerAggregatorService;
import com.volunteerhub.common.enums.UserEventStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/v1/aggregated")
@RequiredArgsConstructor
public class ManagerAggregatorController {

    private final ManagerAggregatorService managerAggregatorService;

    @GetMapping("/manager/registrations")
    public ResponseEntity<List<ManagerRegistrationResponse>> getManagerRegistrations(
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false) UserEventStatus status,
            @RequestParam(value = "pageNum", defaultValue = "0") Integer pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    ) {

        return ResponseEntity.ok(managerAggregatorService.getManagerRegistrations(
                eventId,
                status,
                pageNum,
                pageSize
        ));
    }

    @GetMapping("/export/users")
    public ResponseEntity<byte[]> exportAllUsers(@RequestParam(defaultValue = "csv") String format) {

        byte[] fileContent = managerAggregatorService.exportAllUsers(format);

        String extension = "json".equalsIgnoreCase(format) ? ".json" : ".csv";
        String fileName = "all_users_" + System.currentTimeMillis() + extension;

        MediaType mediaType = "json".equalsIgnoreCase(format)
                ? MediaType.APPLICATION_JSON
                : MediaType.parseMediaType("text/csv");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(mediaType)
                .body(fileContent);
    }
}