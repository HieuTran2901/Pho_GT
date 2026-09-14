package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.CustomerGift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerGiftRepository extends JpaRepository<CustomerGift, String> {

    List<CustomerGift> findByUserIdOrderByCreatedAtDesc(String userId);

    List<CustomerGift> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, String status);

    Optional<CustomerGift> findByCodeIgnoreCase(String code);

    Optional<CustomerGift> findByIdAndUserId(String id, String userId);

    boolean existsByCodeIgnoreCase(String code);

    long countByUserIdAndStatus(String userId, String status);
}
