package com.volunteerhub.AggregationService.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.volunteerhub.common.dto.UserResponse;
import com.volunteerhub.common.enums.UserEventStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ManagerRegistrationResponse {

    @JsonUnwrapped
    private UserResponse userDetails;

    private Long eventId;
    private String eventName;

    private Long registrationId;
    private UserEventStatus status;
    private LocalDateTime registeredAt;
}