package com.volunteerhub.AggregationService.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.volunteerhub.common.dto.EventResponse;
import com.volunteerhub.common.dto.UserResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AggregatedEventResponse {

    @JsonUnwrapped
    private EventResponse eventResponse;
    private UserResponse owner;
    private Long registrationCount;
    private Long participantCount;
}
