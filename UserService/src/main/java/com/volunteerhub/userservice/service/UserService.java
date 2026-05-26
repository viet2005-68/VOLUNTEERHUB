package com.volunteerhub.userservice.service;

import com.volunteerhub.common.enums.UserRole;
import com.volunteerhub.userservice.mapper.UserMapper;
import com.volunteerhub.common.enums.UserStatus;
import com.volunteerhub.userservice.dto.request.UserRequest;
import com.volunteerhub.userservice.dto.response.UserResponse;
import com.volunteerhub.userservice.model.Address;
import com.volunteerhub.userservice.model.User;
import com.volunteerhub.userservice.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserService {

    private final AddressService addressService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RedisTemplate<String, String> customRedisTemplate;
    private final FileStorageService fileStorageService;

    public User findEntityById(String id) {
        return userRepository.findById(id).orElseThrow(() ->
                new NoSuchElementException("No such user with id " + id));
    }

    public UserResponse findById(String id) {
        return userMapper.toResponse(this.findEntityById(id));
    }

    public UserResponse getUserResponseById(String id) {
        UserResponse user = findById(id);
        return user;
    }


    @Transactional
    public UserResponse getOrCreateUserResponseById(String id, UserRole userRole, String name, String email) {
        return userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseGet(() -> create(id, userRole, UserRequest.builder()
                        .authProvider("local")
                        .fullName(resolveProfileName(id, name, email))
                        .username(resolveProfileUsername(id, email))
                        .email(resolveProfileEmail(id, email))
                        .build()));
    }

    private String resolveProfileName(String id, String name, String email) {
        if (StringUtils.hasText(name)) {
            return name;
        }
        if (StringUtils.hasText(email)) {
            return email;
        }
        return id;
    }

    private String resolveProfileUsername(String id, String email) {
        return StringUtils.hasText(email) ? email : id;
    }

    private String resolveProfileEmail(String id, String email) {
        return StringUtils.hasText(email) ? email : id + "@unknown.local";
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() ->
                new NoSuchElementException("No such user with email " + email));
    }

    public List<UserResponse> findAllByIds(List<String> userIds) {
        return userRepository.findAllByIds(userIds).stream().map(userMapper::toResponse).toList();
    }


    public List<UserResponse> findAll(Integer page, Integer pageSize) {
        if (page == null || pageSize == null) {
            return userRepository.findAll().stream()
                    .map(userMapper::toResponse)
                    .collect(Collectors.toList());
        }

        Pageable pageable = PageRequest.of(page, pageSize);
        Page<User> userPage = userRepository.findAll(pageable);

        return userPage.getContent().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<String> findAllIds(UserRole role) {
        return userRepository.findAllIdsByRole(role);
    }

    @Transactional
    public UserResponse create(String userId, UserRole userRole, UserRequest userRequest) {
        Address address = null;
        Long addressId = null;

        if (userRequest.getAddress() != null) {
            address = addressService.findOrCreateAddress(userRequest.getAddress());
            addressId = address.getId();
        }

        User user = User.builder()
                .id(userId)
                .email(userRequest.getEmail())
                .fullName(userRequest.getFullName())
                .username(userRequest.getUsername())
                .authProvider(userRequest.getAuthProvider())
                .role(userRole)
                .status(UserStatus.ACTIVE)
                .bio(userRequest.getBio())
                .avatarUrl(userRequest.getAvatarUrl())
                .skills(userRequest.getSkills())
                .dateOfBirth(userRequest.getDateOfBirth())
                .phoneNumber(userRequest.getPhoneNumber())
                .address(address)
                .addressId(addressId)
                .isDarkMode(userRequest.isDarkMode())
                .build();

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Transactional
    @PreAuthorize("authentication.name == #userId")
    public UserResponse update(String userId, UserRequest userRequest) throws AccessDeniedException {
        User existedUser = this.findEntityById(userId);
        applyUserRequest(existedUser, userRequest);
        return userMapper.toResponse(userRepository.save(existedUser));
    }

    @Transactional
    @PreAuthorize("authentication.name == #userId")
    public UserResponse update(String userId, UserRequest userRequest, MultipartFile avatarFile)
            throws AccessDeniedException, IOException {
        if (userRequest == null && avatarFile == null) {
            throw new IllegalArgumentException("No profile updates provided");
        }

        User existedUser = this.findEntityById(userId);
        applyUserRequest(existedUser, userRequest);

        if (avatarFile != null) {
            String avatarUrl = fileStorageService.uploadProfileAvatar(userId, avatarFile);
            existedUser.setAvatarUrl(avatarUrl);
        }

        return userMapper.toResponse(userRepository.save(existedUser));
    }

    private void applyUserRequest(User existedUser, UserRequest userRequest) {
        if (userRequest == null) {
            return;
        }

        if (userRequest.getBio() != null) {
            existedUser.setBio(userRequest.getBio());
        }
        if (userRequest.getFullName() != null) {
            existedUser.setFullName(userRequest.getFullName());
        }
        if (userRequest.getUsername() != null) {
            existedUser.setUsername(userRequest.getUsername());
        }
        if (userRequest.getEmail() != null) {
            existedUser.setEmail(userRequest.getEmail());
        }
        if (userRequest.getAvatarUrl() != null) {
            existedUser.setAvatarUrl(userRequest.getAvatarUrl());
        }
        if (userRequest.getSkills() != null) {
            existedUser.setSkills(userRequest.getSkills());
        }
        if (userRequest.getDateOfBirth() != null) {
            existedUser.setDateOfBirth(userRequest.getDateOfBirth());
        }
        if (userRequest.getPhoneNumber() != null) {
            existedUser.setPhoneNumber(userRequest.getPhoneNumber());
        }
        if (userRequest.getAddress() != null && userRequest.getAddress().getDistrict() != null &&
                userRequest.getAddress().getProvince() != null && userRequest.getAddress().getStreet() != null) {
            Address address = addressService.findOrCreateAddress(userRequest.getAddress());
            existedUser.setAddress(address);
            existedUser.setAddressId(address.getId());
        }

        if (userRequest.isDarkMode()) {
            existedUser.setDarkMode(true);
        } else {
            existedUser.setDarkMode(false);
        }
    }


    public Long countManagers() {
        return userRepository.countUsers(UserRole.MANAGER);
    }

    public Long countUsers() {
        return userRepository.countUsers(UserRole.USER);
    }

    public UserResponse convertToExportData(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .authProvider(user.getAuthProvider())
                .totalEvents(user.getTotalEvents())
                .phoneNumber(user.getPhoneNumber())
                .dateOfBirth(user.getDateOfBirth())
                .badgeCount(user.getBadges() == null ? 0 : user.getBadges().size())

                .build();
    }

    public List<UserResponse> getExportDataForSelectedUsers(List<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<User> users = userRepository.findAllByIdsWithBadges(userIds);

        return users.stream()
                .map(this::convertToExportData)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getAllUsersForExport() {
        List<User> users = userRepository.findAllForExport();

        return users.stream()
                .map(this::convertToExportData)
                .collect(Collectors.toList());
    }

    public Map<String, Object> checkMissingProfileFields(String userId) {
        User user = this.findEntityById(userId);

        List<String> missingFields = new ArrayList<>();

        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
            missingFields.add("fullName");
        }

        if (user.getDateOfBirth() == null) {
            missingFields.add("dateOfBirth");
        }

        if (user.getAddress() == null) {
            missingFields.add("address");
        }
        Map<String, Object> response = new HashMap<>();

        response.put("isComplete", missingFields.isEmpty());

        response.put("missingFields", missingFields);

        return response;
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse banUser(String userId) {
        User user = this.findEntityById(userId);
        if (user.getStatus().equals(UserStatus.BANNED)) {
            throw new IllegalArgumentException("Invalid state transition");
        }
        user.setStatus(UserStatus.BANNED);
        userRepository.save(user);
        customRedisTemplate.opsForValue().set(userId + "_status", UserStatus.BANNED.toString(), Duration.ofHours(1));
        return userMapper.toResponse(user);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse unbanUser(String userId) {
        User user = this.findEntityById(userId);
        if (user.getStatus().equals(UserStatus.ACTIVE)) {
            throw new IllegalArgumentException("Invalid state transition");
        }
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        customRedisTemplate.opsForValue().set(userId + "_status", UserStatus.ACTIVE.toString(), Duration.ofHours(1));
        return userMapper.toResponse(user);
    }

    @PreAuthorize("hasRole('SYSTEM')")
    public UserStatus getUserStatus(String userId) {
        User user = this.findEntityById(userId);
        customRedisTemplate.opsForValue().set(userId + "_status", user.getStatus().toString(), Duration.ofHours(1));
        return user.getStatus();
    }

}
