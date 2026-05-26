package com.volunteerhub.analyticservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RegistrationExportDto(
        Long eventId, String userId, String status, String note, String registeredAt
) {}