package com.volunteerhub.common.dto.message.registration;

import com.volunteerhub.common.enums.UserEventStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RegistrationCompletedMessage implements RegistrationMessage{

    private Long registrationId;
    private Long eventId;
    private String userId;
    private UserEventStatus status;
    private String note;
    private LocalDateTime completedAt;
}
