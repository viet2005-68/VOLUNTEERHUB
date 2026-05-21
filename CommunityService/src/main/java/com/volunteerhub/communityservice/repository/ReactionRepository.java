package com.volunteerhub.communityservice.repository;

import com.volunteerhub.common.enums.ReactionType;
import com.volunteerhub.communityservice.dto.ReactionCountByType;
import com.volunteerhub.communityservice.model.Reaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import java.time.LocalDateTime;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    Page<Reaction> findByPostIdAndType(Long postId, ReactionType type, Pageable pageable);
    Page<Reaction> findByPostId(Long postId, PageRequest pageRequest);
    Optional<Reaction> findByOwnerIdAndPostId(String ownerId, Long postId);
    int countByPostId(Long postId);

    @Query("SELECT r.type AS type, COUNT(r) AS count " +
            "FROM Reaction r " +
            "WHERE r.postId = :postId " +
            "GROUP BY r.type")
    List<ReactionCountByType> countReactionsByType(@Param("postId") Long postId);

    @Query("SELECT COUNT(r) FROM Reaction r " +
            "WHERE r.post.eventId = :eventId " +
            "AND r.createdAt BETWEEN :startDate AND :endDate")
    long countByEventIdAndDateRange(@Param("eventId") Long eventId,
                                    @Param("startDate") LocalDateTime startDate,
                                    @Param("endDate") LocalDateTime endDate);
}
