package com.volunteerhub.userservice.service;

import com.volunteerhub.userservice.dto.request.UserLoginHistoryRequest;
import com.volunteerhub.userservice.model.User;
import com.volunteerhub.userservice.model.UserLoginHistory;
import com.volunteerhub.userservice.repository.UserLoginHistoryRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserLoginHistoryService {

    private final UserLoginHistoryRepository userLoginHistoryRepository;
    private final UserService userService;

    public List<UserLoginHistory> findByUserId(String userId) {
        return userLoginHistoryRepository.findByUserId(userId);
    }

    public UserLoginHistory create(UserLoginHistoryRequest userLoginHistoryRequest) {
        User user = userService.findEntityById(userLoginHistoryRequest.getUserId());
        UserLoginHistory userLoginHistory = UserLoginHistory.builder()
                .user(user)
                .ipAddress(userLoginHistoryRequest.getIpAddress())
                .build();
        return userLoginHistoryRepository.save(userLoginHistory);
    }
}
