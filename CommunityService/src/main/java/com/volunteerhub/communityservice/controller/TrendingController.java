package com.volunteerhub.communityservice.controller;

import com.volunteerhub.communityservice.dto.EventCommunityStats;
import com.volunteerhub.communityservice.service.CommentService;
import com.volunteerhub.communityservice.service.PostService;
import com.volunteerhub.communityservice.service.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/events/trending_calculation")
@RequiredArgsConstructor
public class TrendingController {

    private final CommentService commentService;
    private final PostService postService;
    private final ReactionService reactionService;

    @GetMapping("/{eventId}/all-stats")
    public ResponseEntity<EventCommunityStats> getEventAllStats(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "7") int days) {

        return ResponseEntity.ok(EventCommunityStats.builder()
                .eventId(eventId)
                .postCount(postService.countPostsByEventLastDays(eventId, days))
                .commentCount(commentService.countCommentsByEventLastDays(eventId, days))
                .reactionCount(reactionService.countReactionsByEventLastDays(eventId, days))
                .build());
    }

    @GetMapping("/{eventId}/comments")
    public ResponseEntity<Long> getCommentCountByEvent(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "7") int days) {

        return ResponseEntity.ok(commentService.countCommentsByEventLastDays(eventId, days));
    }

    @GetMapping("/{eventId}/reactions")
    public ResponseEntity<Long> getReactionCountByEvent(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "7") int days) {

        return ResponseEntity.ok(reactionService.countReactionsByEventLastDays(eventId, days));
    }

    @GetMapping("/{eventId}/posts")
    public ResponseEntity<Long> getPostCountByEvent(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "7") int days) {

        return ResponseEntity.ok(postService.countPostsByEventLastDays(eventId, days));
    }
}