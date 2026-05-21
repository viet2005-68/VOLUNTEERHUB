package com.volunteerhub.userservice.mapper;

import com.volunteerhub.userservice.dto.response.AddressResponse;
import com.volunteerhub.userservice.model.Address;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AddressMapper {
    public AddressResponse toResponse(Address address) {
        if (address == null) {
            return null;
        }
        return AddressResponse.builder()
                .province(address.getProvince())
                .district(address.getDistrict())
                .street(address.getStreet())
                .fullAddress(address.getStreet() + ", " + address.getDistrict() + ", " + address.getProvince())
                .build();
    }
}
