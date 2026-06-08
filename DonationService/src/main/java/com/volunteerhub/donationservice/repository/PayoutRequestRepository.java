package com.volunteerhub.donationservice.repository;

import com.volunteerhub.donationservice.model.PayoutRequest;
import com.volunteerhub.donationservice.model.PayoutStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayoutRequestRepository extends JpaRepository<PayoutRequest, Long> {

    List<PayoutRequest> findByManagerIdOrderByCreatedAtDesc(String managerId);

    List<PayoutRequest> findByStatusOrderByCreatedAtAsc(PayoutStatus status);

    List<PayoutRequest> findAllByOrderByCreatedAtDesc();
}
