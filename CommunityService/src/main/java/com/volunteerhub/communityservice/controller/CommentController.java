package com.volunteerhub.communityservice.controller;

import com.volunteerhub.common.dto.CommentResponse;
import com.volunteerhub.communityservice.dto.CommentRequest;
import com.volunteerhub.communityservice.service.CommentService;
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

@RestController
@RequestMapping("/api/v1/events/{eventId}/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<List<CommentResponse>> findAll(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.findByPostId(postId));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> create(@PathVariable Long postId,
                                  @RequestBody @Validated(OnCreate.class) CommentRequest commentRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(commentService.create(authentication.getName(), postId, commentRequest), HttpStatus.CREATED);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> update(@PathVariable Long commentId,
                                  @RequestBody @Validated(OnUpdate.class) CommentRequest commentRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(commentService.update(authentication.getName(), commentId, commentRequest));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<CommentResponse> delete(@PathVariable Long commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(commentService.delete(authentication.getName(), commentId));
    }

}
