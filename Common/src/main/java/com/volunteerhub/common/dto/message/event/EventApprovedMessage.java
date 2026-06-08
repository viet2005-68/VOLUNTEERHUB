package com.volunteerhub.common.dto.message.event;

import com.volunteerhub.common.dto.CategoryResponse;
import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.QrJoinPolicy;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventApprovedMessage implements EventMessage{

    private Long eventId;
    private String eventName;
    private String imageUrl;
    private CategoryResponse category;
    private int capacity;
    private String ownerId;
    private String approvedBy;
    private EventStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationDeadline;
    private QrJoinPolicy qrJoinPolicy;
    private Long completionBadgeId;
    @Builder.Default
    private LocalDateTime approvedTime = LocalDateTime.now();
}
