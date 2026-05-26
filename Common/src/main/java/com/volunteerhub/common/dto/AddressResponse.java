package com.volunteerhub.common.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {

    private String province;
    private String district;
    private String street;
}
