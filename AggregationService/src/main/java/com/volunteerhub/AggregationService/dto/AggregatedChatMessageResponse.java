package com.volunteerhub.AggregationService.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.volunteerhub.common.dto.UserResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AggregatedChatMessageResponse {

    @JsonUnwrapped
    private ChatMessageResponse message;
    private UserResponse sender;
}
