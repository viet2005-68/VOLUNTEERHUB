package com.volunteerhub.common.dto.message.event;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class EventUpdatedMessage implements EventMessage{

    private Long id;
    private String ownerId;
    private Map<String, Object> updatedFields;
    private LocalDateTime updatedAt;
}
