package com.volunteerhub.userservice.mapper;

import com.volunteerhub.common.dto.UserBadgeResponse;
import com.volunteerhub.userservice.model.UserBadge;
import org.springframework.stereotype.Component;

@Component
public class UserBadgeMapper {

    public UserBadgeResponse toResponse(UserBadge userBadge) {
        return UserBadgeResponse.builder()
                .id(userBadge.getId())
                .badgeId(userBadge.getBadgeId())
                .userId(userBadge.getUser().getId())
                .createdAt(userBadge.getCreatedAt())
                .build();
    }
}
