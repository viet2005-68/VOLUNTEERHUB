package com.volunteerhub.userservice.dto.request;

import com.volunteerhub.userservice.validation.OnCreate;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserBadgeRequest {
    @NotNull(message = "badge id cannot be null", groups = OnCreate.class)
    @Min(value = 1, message = "badge id must be between 1 and 13", groups = OnCreate.class)
    @Max(value = 13, message = "badge id must be between 1 and 13", groups = OnCreate.class)
    private Long badgeId;

    private String userId;
}
