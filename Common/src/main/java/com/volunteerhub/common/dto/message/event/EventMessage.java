package com.volunteerhub.common.dto.message.event;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = EventCreatedMessage.class, name = "EVENT_CREATED"),
        @JsonSubTypes.Type(value = EventApprovedMessage.class, name = "EVENT_APPROVED"),
        @JsonSubTypes.Type(value = EventRejectedMessage.class, name = "EVENT_REJECTED"),
        @JsonSubTypes.Type(value = EventUpdatedMessage.class, name = "EVENT_UPDATED"),
        @JsonSubTypes.Type(value = EventDeletedMessage.class, name = "EVENT_DELETED")
})
public interface EventMessage {
}
