package com.volunteerhub.common.dto;

import com.volunteerhub.common.enums.ReactionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReactionResponse {

    private Long id;
    private String ownerId;
    private Long postId;
    private ReactionType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
