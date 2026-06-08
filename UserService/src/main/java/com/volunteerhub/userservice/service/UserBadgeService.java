package com.volunteerhub.userservice.service;

import com.volunteerhub.common.dto.UserBadgeResponse;
import com.volunteerhub.userservice.dto.request.UserBadgeRequest;
import com.volunteerhub.userservice.mapper.UserBadgeMapper;
import com.volunteerhub.userservice.model.User;
import com.volunteerhub.userservice.model.UserBadge;
import com.volunteerhub.userservice.repository.UserBadgeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@AllArgsConstructor
public class UserBadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final UserService userService;
    private final UserBadgeMapper userBadgeMapper;

    public List<UserBadgeResponse> findByUserId(String userId) {
        return userBadgeRepository.findByUserId(userId).stream()
                .map(userBadgeMapper::toResponse)
                .toList();
    }

    public UserBadgeResponse create(UserBadgeRequest userBadgeRequest) {
        return awardBadge(userBadgeRequest.getUserId(), userBadgeRequest.getBadgeId());
    }

    public UserBadgeResponse awardBadge(String userId, Long badgeId) {
        Objects.requireNonNull(userId, "user id cannot be null");
        Objects.requireNonNull(badgeId, "badge id cannot be null");

        return userBadgeRepository.findByUserIdAndBadgeId(userId, badgeId)
                .map(userBadgeMapper::toResponse)
                .orElseGet(() -> createBadge(userId, badgeId));
    }

    private UserBadgeResponse createBadge(String userId, Long badgeId) {
        User user = userService.findEntityById(userId);
        UserBadge userBadge = UserBadge.builder()
                .badgeId(badgeId)
                .user(user)
                .build();
        return userBadgeMapper.toResponse(userBadgeRepository.save(userBadge));
    }
}
