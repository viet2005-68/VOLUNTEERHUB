package com.volunteerhub.common.dto.message.reaction;

import com.volunteerhub.common.enums.ReactionType;
import lombok.*;

@Data
@Builder
public class ReactionCreatedMessage {

    private Long reactionId;
    private String ownerId;
    private Long postId;
    private Long eventId;
    private ReactionType type;
    // User to notify
    private String userId;
}
