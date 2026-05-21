package com.volunteerhub.communityservice.dto;

import com.volunteerhub.communityservice.validation.OnCreate;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PostRequest {

    @NotNull(message = "content must not be null", groups = OnCreate.class)
    private String content;
}
