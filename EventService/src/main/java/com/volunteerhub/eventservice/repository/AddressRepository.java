package com.volunteerhub.eventservice.repository;

import com.volunteerhub.eventservice.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {
    Optional<Address> findByProvinceAndDistrictAndStreet(String province, String district, String street);
}
