package com.volunteerhub.common.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostResponse {

    private Long id;
    private Long eventId;
    private String content;
    private List<String> imageUrls;
    private String ownerId;
    private int reactionCount;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
