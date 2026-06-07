package com.volunteerhub.userservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserAnalyticsSummaryResponse {
    private Long totalUsers;
    private Long totalManagers;
    private Long totalAdmins;
    private Long activeUsers;
    private Long bannedUsers;
}
