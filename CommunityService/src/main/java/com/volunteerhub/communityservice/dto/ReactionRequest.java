package com.volunteerhub.communityservice.dto;

import com.volunteerhub.common.enums.ReactionType;
import com.volunteerhub.communityservice.validation.OnCreate;
import com.volunteerhub.communityservice.validation.OnUpdate;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReactionRequest {

    @NotNull(message = "reaction must no be null", groups = {OnUpdate.class, OnCreate.class})
    private ReactionType type;
}
