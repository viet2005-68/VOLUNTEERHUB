package com.volunteerhub.userservice.dto.request;

import com.volunteerhub.userservice.validation.OnCreate;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserBadgeRequest {
    @NotNull(message = "badge id cannot be null", groups = OnCreate.class)
    private Long badgeId;

    @NotNull(message = "user id cannot be null", groups = OnCreate.class)
    private String userId;
}
