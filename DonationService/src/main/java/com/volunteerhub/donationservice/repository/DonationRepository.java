package com.volunteerhub.donationservice.repository;

import com.volunteerhub.donationservice.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DonationRepository extends JpaRepository<Donation, Long> {

    Optional<Donation> findByDonorIdAndClientDonationId(String donorId, String clientDonationId);

    List<Donation> findByManagerIdOrderByCreatedAtDesc(String managerId);

    List<Donation> findByDonorIdOrderByCreatedAtDesc(String donorId);
}
