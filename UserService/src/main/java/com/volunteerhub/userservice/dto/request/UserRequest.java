package com.volunteerhub.userservice.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.volunteerhub.userservice.validation.OnCreate;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class UserRequest {
    @NotNull(message = "Auth provider cannot be null", groups = OnCreate.class)
    private String authProvider;

    @NotNull(message = "Full name cannot be null", groups = OnCreate.class)
    @JsonProperty("fullName")
    private String fullName;

//    @NotNull(message = "Username cannot be null", groups = OnCreate.class)
    @JsonProperty("username")
    private String username;

    @NotBlank(message = "Email cannot be empty", groups = OnCreate.class)
    @Email(message = "Invalid email format")
    private String email;

    private String bio;

    private String avatarUrl;

    @Past(message = "Date of birth must be in the past")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number format")
    private String phoneNumber;

    @Valid
//    @NotNull(message = "Address cannot be null", groups = OnCreate.class)
    private AddressRequest address;

    @Size(max = 10, message = "You can only add up to 10 skills")
    private List<
//            @NotBlank(message = "Skill cannot be empty")
            @Size(max = 50, message = "Skill name too long")
                    String
            > skills;

    private boolean darkMode;
}
