package com.volunteerhub.userservice.service;

import com.volunteerhub.userservice.dto.request.UserBadgeRequest;
import com.volunteerhub.userservice.model.User;
import com.volunteerhub.userservice.model.UserBadge;
import com.volunteerhub.userservice.repository.UserBadgeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserBadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final UserService userService;

    public List<UserBadge> findByUserId(String userId) {
        return userBadgeRepository.findByUserId(userId);
    }

    public UserBadge create(UserBadgeRequest userBadgeRequest) {
        User user = userService.findEntityById(userBadgeRequest.getUserId());
        UserBadge userBadge = UserBadge.builder()
                .badgeId(userBadgeRequest.getBadgeId())
                .user(user)
                .build();
        return userBadgeRepository.save(userBadge);
    }
}
