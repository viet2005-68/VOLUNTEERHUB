package com.volunteerhub.AggregationService.dto;

import com.volunteerhub.common.dto.ReactionResponse;
import com.volunteerhub.common.dto.UserResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AggregatedReactionResponse {

    private ReactionResponse reaction;
    private UserResponse owner;
}
