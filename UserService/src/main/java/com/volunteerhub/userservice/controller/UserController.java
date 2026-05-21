package com.volunteerhub.userservice.controller;

import com.volunteerhub.userservice.dto.request.UserRequest;
import com.volunteerhub.userservice.dto.response.UserResponse;
import com.volunteerhub.common.enums.UserRole;
import com.volunteerhub.userservice.model.UserBadge;
import com.volunteerhub.userservice.model.UserLoginHistory;
import com.volunteerhub.userservice.service.UserService;
import com.volunteerhub.userservice.validation.OnCreate;
import com.volunteerhub.userservice.validation.OnUpdate;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/users")
@AllArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userService.getUserResponseById(authentication.getName()));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> findById(@PathVariable String userId) {
        return ResponseEntity.ok(userService.findById(userId));
    }

    @GetMapping("/by-ids")
    public ResponseEntity<List<UserResponse>> findByIds(@RequestParam List<String> userIds) {
        return ResponseEntity.ok(userService.findAllByIds(userIds));
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Validated(OnCreate.class) @RequestBody UserRequest userRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserRole role = authentication.getAuthorities().stream()
                .map(grantedAuthority -> UserRole.valueOf(grantedAuthority.getAuthority().replace("ROLE_", "")))
                .findFirst()
                .orElseThrow(() -> new AccessDeniedException("No role found for user"));
        return new ResponseEntity<>(userService.create(authentication.getName(), role, userRequest), HttpStatus.CREATED);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> update(
            @PathVariable String userId,
            @Validated(OnUpdate.class) @RequestBody UserRequest userRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(userService.update(authentication.getName(), userRequest), HttpStatus.OK);
    }

    @GetMapping("/total_users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> countUsers() {
        return ResponseEntity.ok(userService.countUsers());
    }

    @GetMapping("/total_managers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> countManagers() {
        return ResponseEntity.ok(userService.countManagers());
    }

//    @GetMapping("/export-all")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<List<UserResponse>> exportAllUsers() {
//        return ResponseEntity.ok(userService.getAllUsersForExport());
//    }

    @GetMapping("/me/validate-profile")
    public ResponseEntity<Map<String, Object>> validateMyProfile() {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> result = userService.checkMissingProfileFields(currentUserId);

        return ResponseEntity.ok(result);
    }
}
