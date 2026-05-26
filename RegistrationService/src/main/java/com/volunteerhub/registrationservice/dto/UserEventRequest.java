package com.volunteerhub.registrationservice.dto;

import com.volunteerhub.common.enums.UserEventStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserEventRequest {

    private UserEventStatus status;
    private String note;
}
