package com.volunteerhub.communityservice.service;

import com.volunteerhub.common.dto.PageResponse;
import com.volunteerhub.common.dto.ReactionResponse;
import com.volunteerhub.common.enums.ReactionType;
import com.volunteerhub.communityservice.dto.*;
import com.volunteerhub.communityservice.mapper.ReactionMapper;
import com.volunteerhub.communityservice.model.Post;
import com.volunteerhub.communityservice.model.Reaction;
import com.volunteerhub.communityservice.publisher.ReactionPublisher;
import com.volunteerhub.communityservice.repository.ReactionRepository;
import com.volunteerhub.communityservice.utils.PaginationValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final PostService postService;
    private final ReactionMapper reactionMapper;
    private final RedisTemplate<String, Integer> stringIntegerRedisTemplate;
    private final ReactionPublisher reactionPublisher;

    public Reaction findEntityById(Long id) {
        return reactionRepository.findById(id).orElseThrow(() ->
                new NoSuchElementException("Reaction with id " + id + " does not exist"));
    }

    @PreAuthorize("hasRole('ADMIN') or @postService.canAccessPost(authentication.name, #postId)")
    public PageResponse<ReactionResponse> findByPostId(Long postId, ReactionType type, Integer pageNum, Integer pageSize) {
        PageNumAndSizeResponse pageNumAndSize = PaginationValidation.validate(pageNum, pageSize);
        if (type == null) {
            return reactionMapper.toDtoPage(
                    reactionRepository.findByPostId(postId, PageRequest.of(pageNumAndSize.getPageNum(), pageNumAndSize.getPageSize()))
            );
        }
        return reactionMapper.toDtoPage(
                reactionRepository.findByPostIdAndType(postId, type, PageRequest.of(pageNumAndSize.getPageNum(), pageNumAndSize.getPageSize()))
        );
    }

    @PreAuthorize("hasRole('ADMIN') or @postService.canAccessPost(authentication.name, #postId)")
    public Map<String, Long> getReactionCountByType(Long postId) {
        List<ReactionCountByType> counts = reactionRepository.countReactionsByType(postId);
        return counts.stream()
                .collect(Collectors.toMap(
                        ReactionCountByType::getType,
                        ReactionCountByType::getCount
                ));
    }

    @PreAuthorize("@postService.canAccessPost(authentication.name, #postId)")
    public ReactionResponse create(String userId, Long postId, ReactionRequest reactionRequest) {
        Post post = postService.findEntityById(postId);
        Reaction reaction = Reaction.builder()
                .ownerId(userId)
                .post(post)
                .type(reactionRequest.getType())
                .build();
        Reaction createdReaction = reactionRepository.save(reaction);
        createdReaction.setPostId(postId);
        // Store count in cache
        String reactionCountKey = "reaction_count:" + postId;
        if (Boolean.TRUE.equals(stringIntegerRedisTemplate.hasKey(reactionCountKey))) {
            stringIntegerRedisTemplate.opsForValue().increment(reactionCountKey);
        }

        // Publish event
        reactionPublisher.publicReactionCreatedEvent(reactionMapper.toReactionCreatedMessage(reaction));
        return reactionMapper.toDto(createdReaction);
    }

    public ReactionResponse update(String userId, Long reactionId, ReactionRequest reactionRequest) {
        Reaction reaction = findEntityById(reactionId);
        if (!reaction.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("Insufficient permission to modify this record.");
        }
        if (reactionRequest.getType() != null) {
            reaction.setType(reactionRequest.getType());
        }
        return reactionMapper.toDto(reactionRepository.save(reaction));
    }

    public ReactionResponse updateByUserId(String userId, Long postId, ReactionRequest reactionRequest) {
        Reaction reaction = reactionRepository.findByOwnerIdAndPostId(userId, postId).orElse(null);
        if (reaction == null) {
            return create(userId, postId, reactionRequest);
        }
        if (!reaction.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("Insufficient permission to update this record.");
        }
        if (reactionRequest.getType() != null) {
            if (reactionRequest.getType().equals(reaction.getType())) {
                this.deleteByUserId(userId, postId);
                return reactionMapper.toDto(reaction);
            }
            reaction.setType(reactionRequest.getType());
        }
        return reactionMapper.toDto(reactionRepository.save(reaction));
    }

    public ReactionResponse deleteByUserId(String userId, Long postId) {
        Reaction reaction = reactionRepository.findByOwnerIdAndPostId(userId, postId).orElseThrow(() ->
                new NoSuchElementException("No reaction found!"));
        if (!reaction.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("Insufficient permission to delete this record.");
        }
        reactionRepository.delete(reaction);
        String reactionCountKey = "reaction_count:" + reaction.getPostId();
        if (Boolean.TRUE.equals(stringIntegerRedisTemplate.hasKey(reactionCountKey))) {
            stringIntegerRedisTemplate.opsForValue().decrement(reactionCountKey);
        }
        return reactionMapper.toDto(reaction);
    }

    public ReactionResponse getReaction(String userId, Long postId) {
        Reaction reaction = reactionRepository.findByOwnerIdAndPostId(userId, postId).orElseThrow(() ->
                new NoSuchElementException("No reaction found!"));;
        return reactionMapper.toDto(reaction);
    }

    public ReactionResponse delete(String userId, Long reactionId) {
        Reaction reaction = findEntityById(reactionId);
        if (!reaction.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("Insufficient permission to delete this record.");
        }
        reactionRepository.delete(reaction);
        // Store count in cache
        String reactionCountKey = "reaction_count:" + reaction.getPostId();
        if (Boolean.TRUE.equals(stringIntegerRedisTemplate.hasKey(reactionCountKey))) {
            stringIntegerRedisTemplate.opsForValue().decrement(reactionCountKey);
        }
        return reactionMapper.toDto(reaction);
    }

    public long countReactionsByEventLastDays(Long eventId, int days) {
        if (days < 0) {
            throw new IllegalArgumentException("Days parameter cannot be negative");
        }

        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        return reactionRepository.countByEventIdAndDateRange(eventId, startDate, endDate);
    }
}
