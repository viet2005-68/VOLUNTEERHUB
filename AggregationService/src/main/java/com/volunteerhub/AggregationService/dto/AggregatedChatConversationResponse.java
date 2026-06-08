package com.volunteerhub.AggregationService.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.volunteerhub.common.dto.EventResponse;
import com.volunteerhub.common.dto.UserResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AggregatedChatConversationResponse {

    @JsonUnwrapped
    private ChatConversationResponse conversation;
    private String eventName;
    private EventResponse event;
    private UserResponse manager;
    private UserResponse volunteer;
    private UserResponse otherUser;
}
