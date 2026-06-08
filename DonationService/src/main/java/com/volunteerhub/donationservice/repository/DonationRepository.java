package com.volunteerhub.donationservice.repository;

import com.volunteerhub.donationservice.model.Donation;
import com.volunteerhub.donationservice.model.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DonationRepository extends JpaRepository<Donation, Long> {

    Optional<Donation> findByDonorIdAndClientDonationId(String donorId, String clientDonationId);

    Optional<Donation> findByProviderAndProviderOrderId(String provider, String providerOrderId);

    List<Donation> findByManagerIdOrderByCreatedAtDesc(String managerId);

    List<Donation> findByDonorIdOrderByCreatedAtDesc(String donorId);

    List<Donation> findByDonorIdAndEventIdOrderByCreatedAtDesc(String donorId, Long eventId);

    List<Donation> findByEventIdOrderByCreatedAtDesc(Long eventId);

    List<Donation> findByEventIdAndManagerIdOrderByCreatedAtDesc(Long eventId, String managerId);

    long countByDonorIdAndEventIdAndStatus(String donorId, Long eventId, DonationStatus status);

    long countByEventIdAndStatus(Long eventId, DonationStatus status);

    long countByStatus(DonationStatus status);

    long countByManagerIdAndStatus(String managerId, DonationStatus status);

    long countByManagerId(String managerId);

    @Query("""
            select coalesce(sum(d.amountVnd), 0)
            from Donation d
            where d.donorId = :donorId
              and d.eventId = :eventId
              and d.status = :status
            """)
    Long sumAmountByDonorIdAndEventIdAndStatus(@Param("donorId") String donorId,
                                               @Param("eventId") Long eventId,
                                               @Param("status") DonationStatus status);

    @Query("""
            select coalesce(sum(d.amountVnd), 0)
            from Donation d
            where d.eventId = :eventId
              and d.status = :status
            """)
    Long sumAmountByEventIdAndStatus(@Param("eventId") Long eventId,
                                     @Param("status") DonationStatus status);

    @Query("""
            select coalesce(sum(d.amountVnd), 0)
            from Donation d
            where d.status = :status
            """)
    Long sumAmountByStatus(@Param("status") DonationStatus status);

    @Query("""
            select coalesce(sum(d.amountVnd), 0)
            from Donation d
            where d.managerId = :managerId
              and d.status = :status
            """)
    Long sumAmountByManagerIdAndStatus(@Param("managerId") String managerId,
                                       @Param("status") DonationStatus status);
}
