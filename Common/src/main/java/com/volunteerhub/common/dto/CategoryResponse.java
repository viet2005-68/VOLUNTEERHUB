package com.volunteerhub.common.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {

    private String name;
    private String description;
}
