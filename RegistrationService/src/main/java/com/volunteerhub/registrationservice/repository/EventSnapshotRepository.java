package com.volunteerhub.registrationservice.repository;

import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.registrationservice.model.EventSnapshot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EventSnapshotRepository extends JpaRepository<EventSnapshot, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT es FROM EventSnapshot es WHERE es.eventId = :eventId")
    java.util.Optional<EventSnapshot> findByIdForUpdate(@Param("eventId") Long eventId);

    @Query("SELECT COALESCE(SUM(es.capacity), 0) FROM EventSnapshot es WHERE es.ownerId = :ownerId")
    public Long findCapacityPerManager(@Param("ownerId") String ownerId);

    @Query("SELECT COUNT(*) FROM EventSnapshot es WHERE es.ownerId = :ownerId")
    public Long countEventPerManager(@Param("ownerId") String ownerId);

    @Query("SELECT COUNT(es) FROM EventSnapshot es WHERE es.ownerId = :ownerId AND es.status = :status")
    public Long countSnapshotsByStatus(@Param("ownerId") String ownerId, @Param("status") EventStatus status);
}
