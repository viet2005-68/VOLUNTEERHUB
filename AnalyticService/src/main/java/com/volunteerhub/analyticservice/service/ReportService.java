package com.volunteerhub.analyticservice.service;

import com.volunteerhub.analyticservice.dto.EventExportDto;
import com.volunteerhub.analyticservice.dto.RegistrationExportDto;
import com.volunteerhub.analyticservice.dto.UserExportDto;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.ByteArrayInputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final RestClient userClient;
    private final RestClient eventClient;
    private final RestClient registrationClient;

    private final ExportService exportService;

    public ByteArrayInputStream exportUsers(List<String> ids) {
        List<UserExportDto> data;

        if (ids != null && !ids.isEmpty()) {
            data = userClient.post()
                    .uri("/internal/users/export-selected")
                    .body(ids)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<UserExportDto>>() {});
        } else {
            data = userClient.get()
                    .uri("//export-all")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<UserExportDto>>() {});
        }

        return exportService.exportUsersToCSV(data);
    }

    public ByteArrayInputStream exportEvents() {
        List<EventExportDto> data = eventClient.get()
                .uri("/export-list")
                .retrieve()
                .body(new ParameterizedTypeReference<List<EventExportDto>>() {});

        return exportService.exportEventsToCSV(data);
    }

    public ByteArrayInputStream exportRegistrations(Long eventId) {
        List<RegistrationExportDto> data;

        if (eventId != null) {
            data = registrationClient.get()
                    .uri("/event/" + eventId + "/export")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<RegistrationExportDto>>() {});
        } else {
            data = registrationClient.get()
                    .uri("/export-all")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<RegistrationExportDto>>() {});
        }

        return exportService.exportRegistrationsToCSV(data);
    }
}
