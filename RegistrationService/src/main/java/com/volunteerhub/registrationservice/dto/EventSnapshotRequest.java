package com.volunteerhub.registrationservice.dto;

import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.QrJoinPolicy;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventSnapshotRequest {

    private Long eventId;
    private Integer capacity;
    private EventStatus status;
    private String ownerId;
    private String eventName;
    private String imageUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationDeadline;
    private QrJoinPolicy qrJoinPolicy;
}
