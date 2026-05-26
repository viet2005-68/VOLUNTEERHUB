package com.volunteerhub.common.dto.message.user;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = UserRegisteredMessage.class, name = "USER_REGISTERED"),
        @JsonSubTypes.Type(value = UserUpdatedMessage.class, name = "USER_UPDATED"),
        @JsonSubTypes.Type(value = UserDeactivatedMessage.class, name = "USER_DEACTIVATED"),
        @JsonSubTypes.Type(value = UserDeletedMessage.class, name = "USER_DELETED")
})
public interface UserMessage {
}
