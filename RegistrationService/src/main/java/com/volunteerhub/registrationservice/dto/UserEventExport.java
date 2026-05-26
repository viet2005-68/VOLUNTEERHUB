package com.volunteerhub.registrationservice.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserEventExport {
    private Long id;
    private Long eventId;
    private String userId;
    private String status;
    private String note;
    private String registeredAt;
}