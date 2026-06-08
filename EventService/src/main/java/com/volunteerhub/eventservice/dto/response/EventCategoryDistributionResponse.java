package com.volunteerhub.eventservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventCategoryDistributionResponse {
    private Long categoryId;
    private String categoryName;
    private Long events;
}
