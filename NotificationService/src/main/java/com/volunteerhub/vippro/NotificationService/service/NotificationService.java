package com.volunteerhub.vippro.NotificationService.service;

import com.volunteerhub.vippro.NotificationService.dto.response.NotificationResponse;
import com.volunteerhub.vippro.NotificationService.mapper.NotificationMapper;
import com.volunteerhub.vippro.NotificationService.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    public List<NotificationResponse> getAllNotification(String userId, Integer pageNum, Integer pageSize) {
        int page = (pageNum == null) ? 0 : pageNum;
        int size = (pageSize == null) ? 10 : pageSize;
        if (page < 0) {
            throw new IllegalArgumentException("Page number must be greater than or equal to 0");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be greater than 0");
        }
        return notificationRepository.findByUserIdOrderByIdDesc(userId, PageRequest.of(page, size)).getContent()
                .stream()
                .map(notificationMapper::toResponseDTO)
                .toList();
    }
}
