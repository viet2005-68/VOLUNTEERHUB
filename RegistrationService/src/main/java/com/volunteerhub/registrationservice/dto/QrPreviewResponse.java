package com.volunteerhub.registrationservice.dto;

import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.QrJoinPolicy;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class QrPreviewResponse {

    private Long eventId;
    private String eventName;
    private String ownerId;
    private EventStatus eventStatus;
    private QrJoinPolicy qrJoinPolicy;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationDeadline;
    private Integer capacity;
    private Long participantCount;
}
