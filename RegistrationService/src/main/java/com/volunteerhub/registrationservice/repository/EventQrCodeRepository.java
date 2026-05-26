package com.volunteerhub.registrationservice.repository;

import com.volunteerhub.registrationservice.model.EventQrCode;
import com.volunteerhub.registrationservice.model.QrCodePurpose;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventQrCodeRepository extends JpaRepository<EventQrCode, Long> {

    List<EventQrCode> findByEventIdOrderByIdDesc(Long eventId);

    List<EventQrCode> findByEventIdAndPurposeOrderByIdDesc(Long eventId, QrCodePurpose purpose);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT q FROM EventQrCode q WHERE q.id = :id")
    Optional<EventQrCode> findByIdForUpdate(@Param("id") Long id);
}
