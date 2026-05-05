package com.volunteerhub.eventservice.mapper;

import com.volunteerhub.eventservice.model.Address;
import com.volunteerhub.common.dto.AddressResponse;
import org.springframework.stereotype.Component;

@Component
public class AddressMapper {

    public AddressResponse toDto(Address address) {
        return AddressResponse.builder()
                .province(address.getProvince())
                .district(address.getDistrict())
                .street(address.getStreet())
                .build();
    }
}
