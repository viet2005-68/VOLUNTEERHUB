package com.volunteerhub.common.dto.message.chat;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = ChatMessageCreatedMessage.class, name = "CHAT_MESSAGE_CREATED")
})
public interface ChatMessage {
}
