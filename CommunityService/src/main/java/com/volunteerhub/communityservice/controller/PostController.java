package com.volunteerhub.communityservice.controller;

import com.volunteerhub.common.dto.PageResponse;
import com.volunteerhub.common.dto.PostResponse;
import com.volunteerhub.communityservice.dto.PostRequest;
import com.volunteerhub.communityservice.service.PostService;
import com.volunteerhub.communityservice.validation.OnCreate;
import com.volunteerhub.communityservice.validation.OnUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/events/{eventId}/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<PageResponse<PostResponse>> findAll(@PathVariable Long eventId,
                                                              @RequestParam(defaultValue = "id") String sortedBy,
                                                              @RequestParam(defaultValue = "desc") String order,
                                                              @RequestParam(required = false) Integer pageNum,
                                                              @RequestParam(required = false) Integer pageSize) {
        return ResponseEntity.ok(postService.findByEventId(eventId, sortedBy, order, pageNum, pageSize));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> findById(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.findById(postId));
    }

    @PostMapping
    public ResponseEntity<PostResponse> create(@PathVariable Long eventId,
                               @RequestPart("postRequest") @Validated(OnCreate.class) PostRequest postRequest,
                               @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(postService.create(authentication.getName(), eventId, postRequest, imageFiles));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostResponse> update(@PathVariable Long postId,
                               @RequestPart("postRequest") @Validated(OnUpdate.class) PostRequest postRequest,
                               @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(postService.update(authentication.getName(), postId, postRequest, imageFiles));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<PostResponse> delete(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(postService.delete(authentication.getName(), postId));
    }
}
