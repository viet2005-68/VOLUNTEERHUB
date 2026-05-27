package com.volunteerhub.common.dto.message.event;

import com.volunteerhub.common.dto.CategoryResponse;
import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.QrJoinPolicy;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventCreatedMessage implements EventMessage {

    private Long id;
    private String name;
    private String imageUrl;
    private CategoryResponse category;
    private String ownerId;
    private EventStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationDeadline;
    private int capacity;
    private QrJoinPolicy qrJoinPolicy;
}
