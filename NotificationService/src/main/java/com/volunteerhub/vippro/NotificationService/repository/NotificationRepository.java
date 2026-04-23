package com.volunteerhub.vippro.NotificationService.repository;

import com.volunteerhub.vippro.NotificationService.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdOrderByIdDesc(String userId, PageRequest pageRequest);
}
