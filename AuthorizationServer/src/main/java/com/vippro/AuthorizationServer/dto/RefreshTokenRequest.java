package com.vippro.AuthorizationServer.dto;

import lombok.Data;

@Data
public class RefreshTokenRequest {
    private String refreshToken;
}
