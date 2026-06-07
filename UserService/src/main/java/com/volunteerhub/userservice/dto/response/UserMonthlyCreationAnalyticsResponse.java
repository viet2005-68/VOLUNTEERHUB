package com.volunteerhub.userservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserMonthlyCreationAnalyticsResponse {
    private String month;
    private Long users;
    private Long managers;
    private Long admins;
    private Long total;
}
