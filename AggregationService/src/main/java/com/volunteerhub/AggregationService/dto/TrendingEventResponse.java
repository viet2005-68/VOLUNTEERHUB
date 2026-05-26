package com.volunteerhub.AggregationService.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrendingEventResponse {

    @JsonUnwrapped
    private AggregatedEventResponse eventResponse;
    private Long registrationGrowth;
    private Long participantGrowth;
    private Long commentGrowth;
    private Long reactionGrowth;
    private Long postGrowth;

    @JsonIgnore
    private Double trendingScore;
}
