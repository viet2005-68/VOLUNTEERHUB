package com.volunteerhub.common.dto.message.event;

import com.volunteerhub.common.dto.CategoryResponse;
import com.volunteerhub.common.enums.EventStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventRejectedMessage implements EventMessage{
    private Long eventId;
    private String eventName;
    private CategoryResponse category;
    private String ownerId;
    private String approvedBy;
    private EventStatus status;
    private String reason;
    @Builder.Default
    private LocalDateTime approvedTime = LocalDateTime.now();
}
