package com.volunteerhub.common.utils;

public class PaginationValidation {
    public static PageNumAndSizeResponse validate(Integer pageNum, Integer pageSize) {
        int page = (pageNum == null) ? 0 : pageNum;
        int size = (pageSize == null) ? 10 : pageSize;
        if (page < 0) {
            throw new IllegalArgumentException("Page number must be greater than or equal to 0");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be greater than 0");
        }
        return PageNumAndSizeResponse.builder()
                .pageNum(page)
                .pageSize(size)
                .build();
    }
}
