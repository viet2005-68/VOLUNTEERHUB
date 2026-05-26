package com.volunteerhub.AggregationService.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.volunteerhub.common.dto.EventResponse;
import com.volunteerhub.common.dto.UserEventResponse;
import com.volunteerhub.common.dto.UserResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AggregatedUserEventResponse {

    @JsonUnwrapped
    private UserEventResponse userEventResponse;
    private UserResponse user;
    private EventResponse event;
}
