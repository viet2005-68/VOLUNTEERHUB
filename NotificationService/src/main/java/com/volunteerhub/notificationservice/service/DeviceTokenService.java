package com.volunteerhub.notificationservice.service;

import com.volunteerhub.common.enums.PushChannel;
import com.volunteerhub.notificationservice.dto.request.DeviceTokenRequest;
import com.volunteerhub.notificationservice.model.DeviceToken;
import com.volunteerhub.notificationservice.repository.DeviceTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;

    @Transactional
    public DeviceToken register(String userId, DeviceTokenRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            throw new IllegalArgumentException("Device token must not be blank.");
        }
        DeviceToken deviceToken = deviceTokenRepository.findByToken(request.getToken())
                .orElseGet(DeviceToken::new);
        deviceToken.setUserId(userId);
        deviceToken.setToken(request.getToken());
        deviceToken.setChannel(request.getChannel() == null ? PushChannel.FCM : request.getChannel());
        deviceToken.setPlatform(request.getPlatform());
        return deviceTokenRepository.save(deviceToken);
    }

    @Transactional
    public void delete(String userId, String token) {
        deviceTokenRepository.deleteByUserIdAndToken(userId, token);
    }
}
