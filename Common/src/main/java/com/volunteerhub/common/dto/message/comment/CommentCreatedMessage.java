package com.volunteerhub.common.dto.message.comment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommentCreatedMessage {
    private Long commentId;
    private Long postId;
    private Long eventId;
    private Long parentId;
    private String ownerId;
    // User to notify
    private String userId;
    private String content;
}
