package com.volunteerhub.communityservice.mapper;

import com.volunteerhub.common.dto.PostResponse;
import com.volunteerhub.common.dto.ReactionResponse;
import com.volunteerhub.common.dto.message.post.PostCreatedMessage;
import com.volunteerhub.communityservice.model.Post;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class PostMapper {

    public PostResponse toDto(Post post, int reactionCount, int commentCount) {
        return toDto(post, reactionCount, commentCount, null, null);
    }

    public PostResponse toDto(
            Post post,
            int reactionCount,
            int commentCount,
            Map<String, Long> reactionCounts,
            ReactionResponse myReaction
    ) {
        return PostResponse.builder()
                .id(post.getId())
                .eventId(post.getEventId())
                .content(post.getContent())
                .imageUrls(post.getImageUrls())
                .ownerId(post.getOwnerId())
                .reactionCount(reactionCount)
                .reactionCounts(reactionCounts)
                .myReaction(myReaction)
                .myReactionType(myReaction == null ? null : myReaction.getType())
                .shareCount(post.getShareCount())
                .commentCount(commentCount)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    public PostCreatedMessage toPostCreatedMessage(Post post) {
        return PostCreatedMessage.builder()
                .postId(post.getId())
                .eventId(post.getEventId())
                .content(post.getContent())
                .ownerId(post.getOwnerId())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
