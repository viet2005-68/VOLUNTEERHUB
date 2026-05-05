package com.volunteerhub.eventservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RejectRequest {

    private String reason;
}
