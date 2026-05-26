package com.volunteerhub.common.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EventResponseCSV {
    private Long id;
    private String name;
    private String ownerId;
    private String status;

    private String categoryName;
    private String fullAddress;

    private String startTime;
    private String endTime;

    private Integer capacity;
    private Integer badgeCount;
}
