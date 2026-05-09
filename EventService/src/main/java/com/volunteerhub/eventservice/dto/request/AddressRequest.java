package com.volunteerhub.eventservice.dto.request;

import com.volunteerhub.eventservice.validation.OnCreate;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank(message = "Province cannot be blank", groups = OnCreate.class)
    private String province;

    @NotBlank(message = "District cannot be blank", groups = OnCreate.class)
    private String district;

    @NotBlank(message = "Street cannot be blank", groups = OnCreate.class)
    private String street;
}
