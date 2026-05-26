package com.volunteerhub.common.dto.message.registration;

import com.volunteerhub.common.enums.UserEventStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RegistrationCreatedMessage implements RegistrationMessage{

    private Long registrationId;
    private String userId;
    private Long eventId;
    private String eventOwnerId;
    private UserEventStatus status;
    private LocalDateTime createdAt;
}
