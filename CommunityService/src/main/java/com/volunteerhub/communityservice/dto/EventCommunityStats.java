package com.volunteerhub.communityservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventCommunityStats {
    private Long eventId;
    private Long postCount;
    private Long commentCount;
    private Long reactionCount;
}
