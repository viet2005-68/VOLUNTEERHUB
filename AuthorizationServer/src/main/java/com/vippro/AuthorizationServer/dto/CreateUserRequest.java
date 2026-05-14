package com.vippro.AuthorizationServer.dto;

import com.vippro.AuthorizationServer.model.Role;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateUserRequest {

    private String username;

    private String name;
    private String password;
    private String email;

    private Role roles = Role.USER;

}