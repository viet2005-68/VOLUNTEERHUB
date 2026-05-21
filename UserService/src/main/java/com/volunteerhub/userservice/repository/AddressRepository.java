package com.volunteerhub.userservice.repository;

import com.volunteerhub.userservice.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {
    Optional<Address> findByProvinceAndDistrictAndStreet(String province, String district, String street);
}
