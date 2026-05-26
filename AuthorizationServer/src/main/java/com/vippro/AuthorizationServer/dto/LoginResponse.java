package com.vippro.AuthorizationServer.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String accessToken;
    private String tokenType;
    private long expiresIn;
    private String role;
    private String userId;
    private String email;
    private String name;
}
