package com.volunteerhub.common.dto.message.event;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EventDeletedMessage implements EventMessage{

    private Long eventId;
    private String name;
    private String ownerId;
}
