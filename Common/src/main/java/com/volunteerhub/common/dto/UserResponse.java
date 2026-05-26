package com.volunteerhub.common.dto;

import com.volunteerhub.common.enums.UserRole;
import com.volunteerhub.common.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserResponse {

    private String id;
    private String authProvider;
    private String fullName;
    private String username;
    private String email;
    private UserRole role;
    private String bio;
    private String avatarUrl;
    private Integer totalEvents;
    private UserStatus status;
    private List<String> skills;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private AddressResponse address;
    private boolean isDarkMode;
    private LocalDateTime createdAt;
}
