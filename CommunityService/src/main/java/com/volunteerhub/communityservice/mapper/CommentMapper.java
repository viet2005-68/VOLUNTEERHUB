package com.volunteerhub.communityservice.mapper;

import com.volunteerhub.common.dto.CommentResponse;
import com.volunteerhub.common.dto.PageResponse;
import com.volunteerhub.common.dto.message.comment.CommentCreatedMessage;
import com.volunteerhub.communityservice.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CommentMapper {

    public CommentResponse toDto(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .ownerId(comment.getOwnerId())
                .content(comment.getContent())
                .parentId(comment.getParentId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    public PageResponse<CommentResponse> toPageDto(Page<Comment> comments) {
        List<CommentResponse> dtoList = comments.getContent().stream()
                .map(this::toDto)
                .toList();
        return PageResponse.<CommentResponse>builder()
                .content(dtoList)
                .totalPages(comments.getTotalPages())
                .totalElements(comments.getTotalElements())
                .number(comments.getNumber())
                .size(comments.getSize())
                .build();
    }

    public CommentCreatedMessage toCommentCreatedMessage(Comment comment) {
        return CommentCreatedMessage.builder()
                .commentId(comment.getId())
                .postId(comment.getPostId())
                .ownerId(comment.getOwnerId())
                .content(comment.getContent())
                .userId(comment.getPost().getOwnerId())
                .build();
    }
}
