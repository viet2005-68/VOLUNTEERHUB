package com.volunteerhub.common.utils;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PageNumAndSizeResponse {

    private int pageNum;
    private int pageSize;
}
