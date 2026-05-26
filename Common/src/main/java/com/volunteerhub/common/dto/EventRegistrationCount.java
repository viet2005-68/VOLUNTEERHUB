package com.volunteerhub.common.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EventRegistrationCount {
    private Long eventId;
    private Long registrationCount;
    private Long participantCount;
}
