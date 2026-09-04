package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, String> {
    List<Address> findByUserIdOrderByIsDefaultDescCreatedAtDesc(String userId);
    List<Address> findByUserId(String userId);
}
