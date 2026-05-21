package com.volunteerhub.communityservice.mapper;

import com.volunteerhub.common.dto.PostResponse;
import com.volunteerhub.common.dto.message.post.PostCreatedMessage;
import com.volunteerhub.communityservice.model.Post;
import org.springframework.stereotype.Component;

@Component
public class PostMapper {

    public PostResponse toDto(Post post, int reactionCount, int commentCount) {
        return PostResponse.builder()
                .id(post.getId())
                .eventId(post.getEventId())
                .content(post.getContent())
                .imageUrls(post.getImageUrls())
                .ownerId(post.getOwnerId())
                .reactionCount(reactionCount)
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
