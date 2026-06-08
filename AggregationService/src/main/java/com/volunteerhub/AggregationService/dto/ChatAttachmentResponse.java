package com.volunteerhub.AggregationService.dto;

import lombok.Data;

@Data
public class ChatAttachmentResponse {

    private Long id;
    private String type;
    private String url;
    private String mimeType;
    private String fileName;
    private Long size;
}
