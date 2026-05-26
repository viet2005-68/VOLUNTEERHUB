package com.volunteerhub.AggregationService.service;

import com.volunteerhub.AggregationService.client.CommunityClient;
import com.volunteerhub.AggregationService.client.UserClient;
import com.volunteerhub.AggregationService.dto.AggregatedCommentResponse;
import com.volunteerhub.AggregationService.dto.AggregatedPostResponse;
import com.volunteerhub.AggregationService.dto.AggregatedReactionResponse;
import com.volunteerhub.common.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityAggregatorService {

    private final CommunityClient communityClient;
    private final UserClient userClient;

    public PageResponse<AggregatedPostResponse> getAllAggregatedPost(Long eventId, String sortedBy, String order, Integer pageNum, Integer pageSize) {
        PageResponse<PostResponse> posts = communityClient.findAllPosts(eventId, sortedBy, order, pageNum, pageSize);
        List<String> userIds = posts.getContent().stream().map(PostResponse::getOwnerId).toList();
        List<UserResponse> users = userClient.findAllByIds(userIds);
        Map<String, UserResponse> usersMap = users.stream().collect(Collectors.toMap(UserResponse::getId, Function.identity()));
        List<AggregatedPostResponse> dtoList = posts.getContent().stream()
                .map(p -> {
                    UserResponse userResponse = usersMap.getOrDefault(p.getOwnerId(), UserResponse.builder().build());
                    return AggregatedPostResponse.builder()
                            .post(p)
                            .owner(userResponse)
                            .build();
                })
                .toList();
        return PageResponse.<AggregatedPostResponse>builder()
                .content(dtoList)
                .totalPages(posts.getTotalPages())
                .totalElements(posts.getTotalElements())
                .number(posts.getNumber())
                .size(posts.getSize())
                .build();
    }

    public AggregatedPostResponse getAggregatedPostById(Long eventId, Long postId) {
        PostResponse postResponse = communityClient.findPostById(eventId, postId);
        UserResponse userResponse = userClient.findById(postResponse.getOwnerId());
        return AggregatedPostResponse.builder()
                .post(postResponse)
                .owner(userResponse)
                .build();
    }

    public List<AggregatedCommentResponse> getAllAggregatedComment(Long eventId, Long postId) {
        List<CommentResponse> posts = communityClient.findAllComments(eventId, postId);
        List<String> userIds = posts.stream().map(CommentResponse::getOwnerId).toList();
        List<UserResponse> users = userClient.findAllByIds(userIds);
        Map<String, UserResponse> usersMap = users.stream().collect(Collectors.toMap(UserResponse::getId, Function.identity()));
        List<AggregatedCommentResponse> dtoList = posts.stream()
                .map(p -> {
                    UserResponse userResponse = usersMap.getOrDefault(p.getOwnerId(), UserResponse.builder().build());
                    return AggregatedCommentResponse.builder()
                            .comment(p)
                            .owner(userResponse)
                            .build();
                })
                .toList();
        return buildCommentTree(dtoList);
    }

    public PageResponse<AggregatedReactionResponse> getAllAggregatedReaction(Long eventId, Long postId, Integer pageNum, Integer pageSize) {
        PageResponse<ReactionResponse> posts = communityClient.findAllReactions(eventId, postId, pageNum, pageSize);
        List<String> userIds = posts.getContent().stream().map(ReactionResponse::getOwnerId).toList();
        List<UserResponse> users = userClient.findAllByIds(userIds);
        Map<String, UserResponse> usersMap = users.stream().collect(Collectors.toMap(UserResponse::getId, Function.identity()));
        List<AggregatedReactionResponse> dtoList = posts.getContent().stream()
                .map(p -> {
                    UserResponse userResponse = usersMap.getOrDefault(p.getOwnerId(), UserResponse.builder().build());
                    return AggregatedReactionResponse.builder()
                            .reaction(p)
                            .owner(userResponse)
                            .build();
                })
                .toList();
        return PageResponse.<AggregatedReactionResponse>builder()
                .content(dtoList)
                .totalPages(posts.getTotalPages())
                .totalElements(posts.getTotalElements())
                .number(posts.getNumber())
                .size(posts.getSize())
                .build();
    }

    private List<AggregatedCommentResponse> buildCommentTree(List<AggregatedCommentResponse> flatList) {
        Map<Long, AggregatedCommentResponse> map = new HashMap<>();
        List<AggregatedCommentResponse> roots = new ArrayList<>();

        // 1. Put all comments in a map for quick lookup
        for (AggregatedCommentResponse c : flatList) {
            map.put(c.getComment().getId(), c);
            if (c.getReplies() == null) {
                c.setReplies(new ArrayList<>());
            }
        }

        // 2. Build parent->children structure
        for (AggregatedCommentResponse c : flatList) {
            Long parentId = c.getComment().getParentId();
            if (parentId == null) {
                roots.add(c);
            } else {
                AggregatedCommentResponse parent = map.get(parentId);
                if (parent != null) {
                    parent.getReplies().add(c);
                } else {
                    // orphan case if parent doesn't exist: treat as root
                    roots.add(c);
                }
            }
        }

        return roots;
    }

}
