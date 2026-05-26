package com.volunteerhub.common.dto.message.registration;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = RegistrationCreatedMessage.class, name = "REGISTRATION_CREATED"),
        @JsonSubTypes.Type(value = RegistrationApprovedMessage.class, name = "REGISTRATION_APPROVED"),
        @JsonSubTypes.Type(value = RegistrationRejectedMessage.class, name = "REGISTRATION_REJECTED"),
        @JsonSubTypes.Type(value = RegistrationCompletedMessage.class, name = "REGISTRATION_COMPLETED")
})
public interface RegistrationMessage {
}
