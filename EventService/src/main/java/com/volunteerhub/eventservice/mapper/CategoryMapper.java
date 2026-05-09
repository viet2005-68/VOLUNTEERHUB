package com.volunteerhub.eventservice.mapper;

import com.volunteerhub.eventservice.model.Category;
import com.volunteerhub.common.dto.CategoryResponse;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toDto(Category category) {
        return CategoryResponse.builder()
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}
