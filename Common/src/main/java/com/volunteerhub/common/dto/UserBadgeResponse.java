package com.volunteerhub.common.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserBadgeResponse {
    private Long id;
    private Long badgeId;
    private String userId;
    private LocalDateTime createdAt;
}
