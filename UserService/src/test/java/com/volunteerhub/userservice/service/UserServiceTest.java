package com.volunteerhub.userservice.service;

import com.volunteerhub.common.enums.UserRole;
import com.volunteerhub.common.enums.UserStatus;
import com.volunteerhub.userservice.dto.request.UserRequest;
import com.volunteerhub.userservice.dto.response.UserResponse;
import com.volunteerhub.userservice.mapper.AddressMapper;
import com.volunteerhub.userservice.mapper.UserMapper;
import com.volunteerhub.userservice.model.User;
import com.volunteerhub.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private AddressService addressService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RedisTemplate<String, String> customRedisTemplate;

    @Mock
    private FileStorageService fileStorageService;

    private UserService userService;

    @BeforeEach
    void setUp() {
        UserMapper userMapper = new UserMapper(new AddressMapper());
        userService = new UserService(
                addressService,
                userRepository,
                userMapper,
                customRedisTemplate,
                fileStorageService
        );
    }

    @Test
    void updateUploadsAvatarAndUpdatesProfileFields() throws Exception {
        User existingUser = existingUser();
        UserRequest request = UserRequest.builder()
                .bio("Updated bio")
                .phoneNumber("+12345678901")
                .build();
        MockMultipartFile avatarFile = new MockMultipartFile(
                "avatarFile",
                "avatar.png",
                "image/png",
                "avatar-bytes".getBytes()
        );

        when(userRepository.findById("user-1")).thenReturn(Optional.of(existingUser));
        when(fileStorageService.uploadProfileAvatar("user-1", avatarFile))
                .thenReturn("https://firebasestorage.googleapis.com/avatar.png");
        when(userRepository.save(existingUser)).thenReturn(existingUser);

        UserResponse response = userService.update("user-1", request, avatarFile);

        assertThat(response.getAvatarUrl()).isEqualTo("https://firebasestorage.googleapis.com/avatar.png");
        assertThat(response.getBio()).isEqualTo("Updated bio");
        assertThat(response.getPhoneNumber()).isEqualTo("+12345678901");
        verify(fileStorageService).uploadProfileAvatar("user-1", avatarFile);
        verify(userRepository).save(existingUser);
    }

    @Test
    void updateWithOnlyUserRequestKeepsExistingJsonBehavior() throws Exception {
        User existingUser = existingUser();
        UserRequest request = UserRequest.builder()
                .bio("Only profile fields")
                .avatarUrl("https://example.com/avatar.jpg")
                .build();

        when(userRepository.findById("user-1")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(existingUser)).thenReturn(existingUser);

        UserResponse response = userService.update("user-1", request, null);

        assertThat(response.getAvatarUrl()).isEqualTo("https://example.com/avatar.jpg");
        assertThat(response.getBio()).isEqualTo("Only profile fields");
        verifyNoInteractions(fileStorageService);
        verify(userRepository).save(existingUser);
    }

    @Test
    void getOrCreateUserResponseByIdCreatesMissingProfileFromTokenClaims() {
        when(userRepository.findById("user-2")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.getOrCreateUserResponseById(
                "user-2",
                UserRole.USER,
                "Mobile User",
                "mobile@example.com"
        );

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());

        User createdUser = savedUser.getValue();
        assertThat(createdUser.getId()).isEqualTo("user-2");
        assertThat(createdUser.getFullName()).isEqualTo("Mobile User");
        assertThat(createdUser.getUsername()).isEqualTo("mobile@example.com");
        assertThat(createdUser.getEmail()).isEqualTo("mobile@example.com");
        assertThat(createdUser.getRole()).isEqualTo(UserRole.USER);
        assertThat(response.getEmail()).isEqualTo("mobile@example.com");
    }

    private User existingUser() {
        return User.builder()
                .id("user-1")
                .authProvider("local")
                .fullName("Existing User")
                .email("user@example.com")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .bio("Old bio")
                .avatarUrl("https://example.com/old-avatar.jpg")
                .isDarkMode(false)
                .build();
    }
}
