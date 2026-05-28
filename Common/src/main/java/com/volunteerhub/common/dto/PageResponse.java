package com.volunteerhub.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PageResponse<T> {
    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int number;
    private int size;

    @JsonProperty(value = "page", access = JsonProperty.Access.WRITE_ONLY)
    public void setPage(PageMetadata page) {
        if (page == null) {
            return;
        }

        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
        this.number = page.getNumber();
        this.size = page.getSize();
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PageMetadata {
        private long totalElements;
        private int totalPages;
        private int number;
        private int size;
    }
}
