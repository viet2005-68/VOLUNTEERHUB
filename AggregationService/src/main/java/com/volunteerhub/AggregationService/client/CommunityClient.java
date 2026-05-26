package com.volunteerhub.AggregationService.client;

import com.volunteerhub.AggregationService.config.FeignConfig;
import com.volunteerhub.AggregationService.dto.EventCommunityStats;
import com.volunteerhub.common.dto.CommentResponse;
import com.volunteerhub.common.dto.PageResponse;
import com.volunteerhub.common.dto.PostResponse;
import com.volunteerhub.common.dto.ReactionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "COMMUNITYSERVICE", path = "/api/v1/events", configuration = FeignConfig.class)
public interface CommunityClient {

    @GetMapping("/{eventId}/posts")
    PageResponse<PostResponse> findAllPosts(@PathVariable Long eventId,
                                            @RequestParam(defaultValue = "id") String sortedBy,
                                            @RequestParam(defaultValue = "desc") String order,
                                            @RequestParam(required = false) Integer pageNum,
                                            @RequestParam(required = false) Integer pageSize);

    @GetMapping("/{eventId}/posts/{postId}")
    PostResponse findPostById(@PathVariable Long eventId,
                              @PathVariable Long postId);

    @GetMapping("/{eventId}/posts/{postId}/comments")
    List<CommentResponse> findAllComments(@PathVariable Long eventId,
                                          @PathVariable Long postId);

    @GetMapping("/{eventId}/posts/{postId}/reactions")
    PageResponse<ReactionResponse> findAllReactions(@PathVariable Long eventId,
                                                    @PathVariable Long postId,
                                                    @RequestParam(required = false) Integer pageNum,
                                                    @RequestParam(required = false) Integer pageSize);

    @GetMapping("/trending_calculation/{eventId}/comments")
    Long getCommentCountInLastDays(@PathVariable("eventId") Long eventId,
                                   @RequestParam(defaultValue = "7") int days);

    @GetMapping("/trending_calculation/{eventId}/reactions")
    Long getReactionCountInLastDays(@PathVariable("eventId") Long eventId,
                                    @RequestParam(defaultValue = "7") int days);

    @GetMapping("/trending_calculation/{eventId}/posts")
    Long getPostCountInLastDays(@PathVariable("eventId") Long eventId,
                                @RequestParam(defaultValue = "7") int days);

    @GetMapping("/trending_calculation/{eventId}/all-stats")
    EventCommunityStats getEventAllStats(
            @PathVariable("eventId") Long eventId,
            @RequestParam(value="days", defaultValue = "3650") int days
    );
}
