package com.volunteerhub.communityservice.dto;

import com.volunteerhub.communityservice.validation.OnCreate;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CommentRequest {

    private Long parentId;
    @NotNull(message = "content must not be null")
    private String content;
}
