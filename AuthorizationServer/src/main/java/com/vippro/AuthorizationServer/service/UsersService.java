package com.vippro.AuthorizationServer.service;

import com.vippro.AuthorizationServer.model.Role;
import com.vippro.AuthorizationServer.model.User;
import com.vippro.AuthorizationServer.repository.UsersRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UsersService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    public UsersService(UsersRepository usersRepository, PasswordEncoder passwordEncoder) {
        this.usersRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void createUser(String username, String name, String email, String rawPassword, Role roles) {
        if (usersRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (usersRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        String hashedPassword = passwordEncoder.encode(rawPassword);
        User user = User.builder()
                .username(username)
                .name(name)
                .passwordHash(hashedPassword)
                .email(email)
                .roles(roles)
                .build();
        usersRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return usersRepository.findByUsername(username);
    }

    public Optional<User> findByEmail(String email) {
        return usersRepository.findByEmail(email);
    }

    public User updateUser(UUID userId, String newPassword, Role newRoles) {
        User user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (newPassword != null && !newPassword.isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(newPassword));
        }
        if (newRoles != null) {
            user.setRoles(newRoles);
        }
        user.setUpdatedAt(LocalDateTime.now());
        return usersRepository.save(user);
    }
}
