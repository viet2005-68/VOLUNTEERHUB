package com.volunteerhub.notificationservice.controller;

import com.volunteerhub.notificationservice.dto.response.NotificationResponse;
import com.volunteerhub.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationResponse> getAllNotification(@RequestParam(required = false) Integer pageNum,
                                                         @RequestParam(required = false) Integer pageSize) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return notificationService.getAllNotification(authentication.getName(), pageNum, pageSize);
    }

    @PutMapping("/{notificationId}/mark-as-read")
    public NotificationResponse markAsRead(@PathVariable Long notificationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return notificationService.markAsRead(authentication.getName(), notificationId);
    }

    @DeleteMapping("/{notificationId}")
    public NotificationResponse delete(@PathVariable Long notificationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return notificationService.delete(authentication.getName(), notificationId);
    }
}
