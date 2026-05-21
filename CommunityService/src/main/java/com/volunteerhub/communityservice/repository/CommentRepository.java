package com.volunteerhub.communityservice.repository;

import com.volunteerhub.communityservice.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostId(Long postId);

    int countByPostId(Long postId);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(c) FROM Comment c " +
            "WHERE c.post.eventId = :eventId " +
            "AND c.createdAt BETWEEN :startDate AND :endDate")
    long countByEventIdAndDateRange(@Param("eventId") Long eventId,
                                    @Param("startDate") LocalDateTime startDate,
                                    @Param("endDate") LocalDateTime endDate);
    List<Comment> findByParentId(Long parentId);
}
