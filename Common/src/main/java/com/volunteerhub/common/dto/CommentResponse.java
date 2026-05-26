package com.volunteerhub.common.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {

    private Long id;
    private String ownerId;
    private Long postId;
    private Long parentId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
