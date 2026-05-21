package com.volunteerhub.userservice.dto.response;

import com.volunteerhub.common.enums.UserRole;
import com.volunteerhub.common.enums.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String id;
    private String fullName;
    private String email;
    private UserRole role;
    private UserStatus status;
    private String authProvider;
    private String bio;
    private Integer totalEvents;
    private Integer badgeCount;
    private String avatarUrl;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private AddressResponse address;
    private List<String> skills;
    private boolean darkMode;
}
