package com.volunteerhub.common.dto.message.post;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PostCreatedMessage {

    private Long postId;
    private Long eventId;
    private String content;
    private String ownerId;
    private LocalDateTime createdAt;
}
