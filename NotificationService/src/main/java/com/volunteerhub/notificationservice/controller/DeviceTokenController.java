package com.volunteerhub.notificationservice.controller;

import com.volunteerhub.notificationservice.dto.request.DeviceTokenRequest;
import com.volunteerhub.notificationservice.model.DeviceToken;
import com.volunteerhub.notificationservice.service.DeviceTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications/devices")
@RequiredArgsConstructor
public class DeviceTokenController {

    private final DeviceTokenService deviceTokenService;

    @PostMapping
    public ResponseEntity<DeviceToken> register(@RequestBody DeviceTokenRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(deviceTokenService.register(authentication.getName(), request), HttpStatus.CREATED);
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<Void> delete(@PathVariable String token) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        deviceTokenService.delete(authentication.getName(), token);
        return ResponseEntity.noContent().build();
    }
}
