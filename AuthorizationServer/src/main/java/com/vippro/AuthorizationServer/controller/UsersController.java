package com.vippro.AuthorizationServer.controller;

import com.vippro.AuthorizationServer.dto.CreateUserRequest;
import com.vippro.AuthorizationServer.dto.LoginRequest;
import com.vippro.AuthorizationServer.dto.LoginResponse;
import com.vippro.AuthorizationServer.security.DatabaseUserDetailsService;
import com.vippro.AuthorizationServer.security.SecurityUsers;
import com.vippro.AuthorizationServer.service.TokenService;
import com.vippro.AuthorizationServer.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UsersController {

    private final UsersService usersService;
    private final DatabaseUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @PostMapping("/register")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        usersService.createUser(request.getUsername(), request.getName(), request.getEmail(), request.getPassword(), request.getRoles());
        return new ResponseEntity<>("User created!", HttpStatus.CREATED);
    }

    /**
     * Direct login endpoint for mobile apps (and any client that cannot do
     * browser-based Authorization Code redirect).
     *
     * POST /api/v1/users/login
     * Body: { "username": "...", "password": "..." }
     *
     * Returns a signed JWT with the same structure as the OIDC flow so that
     * ApiGateway's CustomJwtAuthenticationConverter accepts it without changes.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        SecurityUsers user;
        try {
            user = (SecurityUsers) userDetailsService.loadUserByUsername(request.getUsername());
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        String token = tokenService.issue(user);
        String role = user.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("USER");

        return ResponseEntity.ok(LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(tokenService.getTokenValiditySeconds())
                .role(role)
                .userId(user.getId().toString())
                .email(user.getEmail())
                .name(user.getName())
                .build());
    }
}
