package com.volunteerhub.communityservice.controller;

import com.volunteerhub.common.dto.PageResponse;
import com.volunteerhub.common.dto.ReactionResponse;
import com.volunteerhub.common.enums.ReactionType;
import com.volunteerhub.communityservice.dto.ReactionRequest;
import com.volunteerhub.communityservice.service.ReactionService;
import com.volunteerhub.communityservice.validation.OnCreate;
import com.volunteerhub.communityservice.validation.OnUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/events/{eventId}/posts/{postId}/reactions")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;

    @GetMapping
    public ResponseEntity<PageResponse<ReactionResponse>> findAll(@PathVariable Long postId,
                                                                  @RequestParam(required = false) ReactionType type,
                                                                  @RequestParam(required = false) Integer pageNum,
                                                                  @RequestParam(required = false) Integer pageSize) {
        return ResponseEntity.ok(reactionService.findByPostId(postId, type, pageNum, pageSize));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getReactionCountByType(@PathVariable Long postId) {
        return ResponseEntity.ok(reactionService.getReactionCountByType(postId));
    }

    @PostMapping
    public ResponseEntity<ReactionResponse> create(@PathVariable Long postId,
                                   @RequestBody @Validated(OnCreate.class)ReactionRequest reactionRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(reactionService.create(authentication.getName(), postId, reactionRequest), HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<ReactionResponse> updateByUserId(@PathVariable Long eventId,
                                                           @PathVariable Long postId,
                                                           @RequestBody @Validated(OnUpdate.class) ReactionRequest reactionRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(reactionService.updateByUserId(authentication.getName(), postId, reactionRequest));
    }

    @DeleteMapping
    public ResponseEntity<ReactionResponse> deleteByUserId(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(reactionService.deleteByUserId(authentication.getName(), postId));
    }

    @GetMapping("/me")
    public ResponseEntity<ReactionResponse> hasReacted(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(reactionService.getReaction(authentication.getName(), postId));
    }

    @PutMapping("/{reactionId}")
    public ResponseEntity<ReactionResponse> update(@PathVariable Long reactionId,
                                   @RequestBody @Validated(OnUpdate.class) ReactionRequest reactionRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(reactionService.update(authentication.getName(), reactionId, reactionRequest));
    }

    @DeleteMapping("/{reactionId}")
    public ResponseEntity<ReactionResponse> delete(@PathVariable Long reactionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(reactionService.delete(authentication.getName(), reactionId));
    }
}
