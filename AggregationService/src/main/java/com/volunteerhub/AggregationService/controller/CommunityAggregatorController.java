package com.volunteerhub.AggregationService.controller;

import com.volunteerhub.AggregationService.dto.AggregatedCommentResponse;
import com.volunteerhub.AggregationService.dto.AggregatedPostResponse;
import com.volunteerhub.AggregationService.dto.AggregatedReactionResponse;
import com.volunteerhub.AggregationService.service.CommunityAggregatorService;
import com.volunteerhub.common.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/aggregated/events/{eventId}")
@RequiredArgsConstructor
public class CommunityAggregatorController {

    private final CommunityAggregatorService communityAggregatorService;

    @GetMapping("/posts")
    public ResponseEntity<PageResponse<AggregatedPostResponse>> getAllAggregatedPosts(@PathVariable Long eventId,
                                                                                      @RequestParam(defaultValue = "id") String sortedBy,
                                                                                      @RequestParam(defaultValue = "desc") String order,
                                                                                      @RequestParam(required = false) Integer pageNum,
                                                                                      @RequestParam(required = false) Integer pageSize) {
        return ResponseEntity.ok(communityAggregatorService.getAllAggregatedPost(eventId, sortedBy, order, pageNum, pageSize));
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<AggregatedPostResponse> getAggregatedPostById(@PathVariable Long eventId,
                                                                        @PathVariable Long postId) {
        return ResponseEntity.ok(communityAggregatorService.getAggregatedPostById(eventId, postId));
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<AggregatedCommentResponse>> getAllAggregatedComments(@PathVariable Long eventId,
                                                                                    @PathVariable Long postId) {
        return ResponseEntity.ok(communityAggregatorService.getAllAggregatedComment(eventId, postId));
    }

    @GetMapping("/posts/{postId}/reactions")
    public ResponseEntity<PageResponse<AggregatedReactionResponse>> getAllAggregatedReactions(@PathVariable Long eventId,
                                                                                              @PathVariable Long postId,
                                                                                              @RequestParam(required = false) Integer pageNum,
                                                                                              @RequestParam(required = false) Integer pageSize) {
        return ResponseEntity.ok(communityAggregatorService.getAllAggregatedReaction(eventId, postId, pageNum, pageSize));
    }
}
