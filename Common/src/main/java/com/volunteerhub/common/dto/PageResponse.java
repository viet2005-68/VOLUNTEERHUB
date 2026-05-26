package com.volunteerhub.common.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
public class PageResponse<T> {
    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int number;
    private int size;
}
