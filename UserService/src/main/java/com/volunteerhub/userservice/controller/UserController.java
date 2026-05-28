package com.volunteerhub.userservice.controller;

import com.volunteerhub.common.dto.UserBadgeResponse;
import com.volunteerhub.userservice.dto.request.UserRequest;
import com.volunteerhub.userservice.dto.response.UserResponse;
import com.volunteerhub.common.enums.UserRole;
import com.volunteerhub.userservice.model.UserLoginHistory;
import com.volunteerhub.userservice.service.UserBadgeService;
import com.volunteerhub.userservice.service.UserLoginHistoryService;
import com.volunteerhub.userservice.service.UserService;
import com.volunteerhub.userservice.validation.OnCreate;
import com.volunteerhub.userservice.validation.OnUpdate;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users/users")
@AllArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserBadgeService userBadgeService;
    private final UserLoginHistoryService userLoginHistoryService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getUserInfo(
            @RequestHeader(value = "X-USER-EMAIL", required = false) String email,
            @RequestHeader(value = "X-USER-NAME", required = false) String name) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userService.getOrCreateUserResponseById(
                authentication.getName(),
                currentUserRole(authentication),
                name,
                email
        ));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> findById(@PathVariable String userId) {
        return ResponseEntity.ok(userService.findById(userId));
    }

    @GetMapping("/by-ids")
    public ResponseEntity<List<UserResponse>> findByIds(@RequestParam List<String> userIds) {
        return ResponseEntity.ok(userService.findAllByIds(userIds));
    }

    @GetMapping("/badges")
    public ResponseEntity<List<UserBadgeResponse>> getUserBadges() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userBadgeService.findByUserId(authentication.getName()));
    }

    @GetMapping("/{userId}/badges")
    @PreAuthorize("authentication.name == #userId or hasRole('ADMIN')")
    public ResponseEntity<List<UserBadgeResponse>> getUserBadgesByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(userBadgeService.findByUserId(userId));
    }

    @GetMapping("/login-history")
    public ResponseEntity<List<UserLoginHistory>> getUserLoginHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userLoginHistoryService.findByUserId(authentication.getName()));
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

    @PutMapping(value = "/{userId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserResponse> update(
            @PathVariable String userId,
            @Validated(OnUpdate.class) @RequestBody UserRequest userRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(userService.update(authentication.getName(), userRequest), HttpStatus.OK);
    }

    @PutMapping(value = "/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> updateWithAvatar(
            @PathVariable String userId,
            @Validated(OnUpdate.class) @RequestPart(value = "userRequest", required = false) UserRequest userRequest,
            @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(userService.update(authentication.getName(), userRequest, avatarFile), HttpStatus.OK);
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

    private UserRole currentUserRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(grantedAuthority -> UserRole.valueOf(grantedAuthority.getAuthority().replace("ROLE_", "")))
                .findFirst()
                .orElse(UserRole.USER);
    }
}
