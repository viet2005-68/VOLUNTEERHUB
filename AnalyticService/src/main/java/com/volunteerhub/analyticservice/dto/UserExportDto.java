package com.volunteerhub.analyticservice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserExportDto(
        String id,
        @JsonAlias("fullName")
        String name,
        String email,
        String role,
        String status,
        @JsonAlias("authProvider")
        String provider,
        String dateOfBirth,
        Integer totalEvents,
        Integer badgeCount,
        @JsonAlias("createdAt")
        String joinedDate
) {}
