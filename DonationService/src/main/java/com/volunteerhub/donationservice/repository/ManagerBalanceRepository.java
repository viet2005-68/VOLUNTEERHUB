package com.volunteerhub.donationservice.repository;

import com.volunteerhub.donationservice.model.ManagerBalance;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ManagerBalanceRepository extends JpaRepository<ManagerBalance, Long> {

    Optional<ManagerBalance> findByManagerId(String managerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from ManagerBalance b where b.managerId = :managerId")
    Optional<ManagerBalance> findByManagerIdForUpdate(@Param("managerId") String managerId);
}
