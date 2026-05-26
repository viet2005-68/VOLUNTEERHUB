package com.volunteerhub.notificationservice.repository;

import com.volunteerhub.common.enums.PushChannel;
import com.volunteerhub.notificationservice.model.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    List<DeviceToken> findByUserId(String userId);

    List<DeviceToken> findByUserIdAndChannel(String userId, PushChannel channel);

    Optional<DeviceToken> findByToken(String token);

    void deleteByUserIdAndToken(String userId, String token);
}
