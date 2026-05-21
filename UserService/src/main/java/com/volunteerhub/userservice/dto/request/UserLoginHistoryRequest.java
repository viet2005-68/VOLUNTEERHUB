package com.volunteerhub.userservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserLoginHistoryRequest {
    @NotBlank(message = "user id cannot be blank")
    private String userId;
    @NotBlank(message = "ip address cannot be blank")
    private String ipAddress;
}
