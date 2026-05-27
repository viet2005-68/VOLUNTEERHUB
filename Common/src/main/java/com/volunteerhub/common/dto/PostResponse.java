package com.volunteerhub.common.dto;

import com.volunteerhub.common.enums.ReactionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class PostResponse {

    private Long id;
    private Long eventId;
    private String content;
    private List<String> imageUrls;
    private String ownerId;
    private int reactionCount;
    private Map<String, Long> reactionCounts;
    private ReactionResponse myReaction;
    private ReactionType myReactionType;
    private int shareCount;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
