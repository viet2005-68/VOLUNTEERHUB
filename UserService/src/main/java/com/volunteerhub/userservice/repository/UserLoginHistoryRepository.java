package com.volunteerhub.userservice.repository;

import com.volunteerhub.userservice.model.UserLoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserLoginHistoryRepository extends JpaRepository<UserLoginHistory, Long> {
    List<UserLoginHistory> findByUserId(String userId);
}
