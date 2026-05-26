package com.volunteerhub.notificationservice.repository;

import com.volunteerhub.notificationservice.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByUserId(String userId);

    Optional<Subscription> findByEndpoint(String endpoint);
}