package com.vippro.AuthorizationServer.controller;

import com.vippro.AuthorizationServer.dto.CreateUserRequest;
import com.vippro.AuthorizationServer.dto.LoginRequest;
import com.vippro.AuthorizationServer.dto.LoginResponse;
import com.vippro.AuthorizationServer.dto.RefreshTokenRequest;
import com.vippro.AuthorizationServer.repository.UsersRepository;
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
    private final UsersRepository usersRepository;

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

        return ResponseEntity.ok(buildLoginResponse(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshTokenRequest request) {
        try {
            if (request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Refresh token is required");
            }

            var userId = tokenService.validateRefreshToken(request.getRefreshToken());
            SecurityUsers user = usersRepository.findById(userId)
                    .map(SecurityUsers::new)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            return ResponseEntity.ok(buildLoginResponse(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid refresh token");
        }
    }

    private LoginResponse buildLoginResponse(SecurityUsers user) {
        String role = user.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("USER");

        return LoginResponse.builder()
                .accessToken(tokenService.issue(user))
                .refreshToken(tokenService.issueRefreshToken(user))
                .tokenType("Bearer")
                .expiresIn(tokenService.getTokenValiditySeconds())
                .refreshExpiresIn(tokenService.getRefreshTokenValiditySeconds())
                .role(role)
                .userId(user.getId().toString())
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }
}
