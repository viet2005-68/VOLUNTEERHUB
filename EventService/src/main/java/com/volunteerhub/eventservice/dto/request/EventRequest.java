    package com.volunteerhub.eventservice.dto.request;

    import com.fasterxml.jackson.annotation.JsonFormat;
    import com.volunteerhub.eventservice.validation.OnCreate;
    import jakarta.validation.Valid;
    import jakarta.validation.constraints.Min;
    import jakarta.validation.constraints.NotBlank;
    import jakarta.validation.constraints.NotNull;
    import jakarta.validation.constraints.Past;
    import lombok.Data;

    import java.time.LocalDateTime;

    @Data
    public class EventRequest {

        @NotNull(message = "Name cannot be null", groups = OnCreate.class)
        private String name;

        private String description;

        @NotBlank(message = "Category name cannot be blank", groups = OnCreate.class)
        private String categoryName;

        @NotNull(message = "StartTime cannot be null", groups = OnCreate.class)
        @Past(message = "Date of birth must be in the past")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
        private LocalDateTime startTime;

        @NotNull(message = "EndTime cannot be null", groups = OnCreate.class)
        @Past(message = "Date of birth must be in the past")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
        private LocalDateTime endTime;

        @NotNull(message = "registrationDeadline cannot be null", groups = OnCreate.class)
        @Past(message = "Date of birth must be in the past")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
        private LocalDateTime registrationDeadline;

        @Valid
        @NotNull(message = "Address cannot be null", groups = OnCreate.class)
        private AddressRequest address;

        private String optional;

        @Min(value = 1, message = "Capacity must be at least 1", groups = OnCreate.class)
        private int capacity;
    }
