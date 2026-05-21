package com.volunteerhub.communityservice.mapper;

import com.volunteerhub.common.dto.PageResponse;
import com.volunteerhub.common.dto.ReactionResponse;
import com.volunteerhub.common.dto.message.reaction.ReactionCreatedMessage;
import com.volunteerhub.communityservice.model.Reaction;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ReactionMapper {

    public ReactionResponse toDto(Reaction reaction) {
        return ReactionResponse.builder()
                .id(reaction.getId())
                .ownerId(reaction.getOwnerId())
                .postId(reaction.getPostId())
                .type(reaction.getType())
                .createdAt(reaction.getCreatedAt())
                .updatedAt(reaction.getUpdatedAt())
                .build();
    }

    public PageResponse<ReactionResponse> toDtoPage(Page<Reaction> reactions) {
        List<ReactionResponse> dtoList = reactions.getContent()
                .stream()
                .map(this::toDto)
                .toList();
        return PageResponse.<ReactionResponse>builder()
                .content(dtoList)
                .totalElements(reactions.getTotalElements())
                .totalPages(reactions.getTotalPages())
                .number(reactions.getNumber())
                .size(reactions.getSize())
                .build();
    }

    public ReactionCreatedMessage toReactionCreatedMessage(Reaction reaction) {
        return ReactionCreatedMessage.builder()
                .ownerId(reaction.getOwnerId())
                .postId(reaction.getPostId())
                .type(reaction.getType())
                .userId(reaction.getPost().getOwnerId())
                .build();
    }
}
