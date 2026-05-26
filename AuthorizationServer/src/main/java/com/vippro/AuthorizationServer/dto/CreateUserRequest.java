package com.vippro.AuthorizationServer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.vippro.AuthorizationServer.model.Role;
import lombok.Data; // Thêm import này
import lombok.NoArgsConstructor; // Thêm import này

@Data
@NoArgsConstructor
public class CreateUserRequest {

    private String username;

    private String name;
    private String password;
    private String email;

    private Role roles = Role.USER;

}