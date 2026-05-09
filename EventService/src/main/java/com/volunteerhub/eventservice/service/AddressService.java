package com.volunteerhub.eventservice.service;

import com.volunteerhub.eventservice.dto.request.AddressRequest;
import com.volunteerhub.eventservice.model.Address;
import com.volunteerhub.eventservice.repository.AddressRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@AllArgsConstructor
public class AddressService {
    private final AddressRepository addressRepository;

    public Address findById(Long id) {
        return addressRepository.findById(id).orElseThrow(() ->
                new NoSuchElementException("No such address with id " + id));
    }

    public Address findOrCreateAddress(AddressRequest request) {
        return addressRepository.findByProvinceAndDistrictAndStreet(
                request.getProvince(), request.getDistrict(), request.getStreet()
        ).orElseGet(() -> {
            Address newAddress = new Address();
            newAddress.setProvince(request.getProvince());
            newAddress.setDistrict(request.getDistrict());
            newAddress.setStreet(request.getStreet());
            return addressRepository.save(newAddress);
        });
    }

}
