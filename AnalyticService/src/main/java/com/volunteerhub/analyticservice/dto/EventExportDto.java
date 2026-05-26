package com.volunteerhub.analyticservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record EventExportDto(
        Long id,
        String name,
        String ownerId,
        String status,
        String categoryName,
        String fullAddress,
        String startTime,
        String endTime,
        Integer capacity,
        Integer badgeCount
) {}