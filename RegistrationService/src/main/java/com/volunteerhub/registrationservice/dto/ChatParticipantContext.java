package com.volunteerhub.registrationservice.dto;

import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.UserEventStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatParticipantContext {

    private Long eventId;
    private String managerId;
    private String volunteerId;
    private EventStatus eventStatus;
    private UserEventStatus volunteerStatus;
    private boolean canSend;
    private boolean canRead;
}
