package com.volunteerhub.chatservice.dto;

import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.UserEventStatus;
import lombok.Data;

@Data
public class ChatParticipantContext {

    private Long eventId;
    private String managerId;
    private String volunteerId;
    private EventStatus eventStatus;
    private UserEventStatus volunteerStatus;
    private boolean canSend;
    private boolean canRead;
}
