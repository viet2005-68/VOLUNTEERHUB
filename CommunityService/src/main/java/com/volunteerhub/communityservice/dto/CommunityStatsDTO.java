package com.volunteerhub.communityservice.dto;

import lombok.Data;

@Data
public class CommunityStatsDTO {
    private Long eventId;
    private Long postCount;
    private Long commentCount;
    private Long reactionCount;
}