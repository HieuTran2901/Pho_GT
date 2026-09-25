package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.CustomerGift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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

    List<CustomerGift> findByOrderId(String orderId);

    @Modifying
    @Query("UPDATE CustomerGift g SET g.status = 'RESERVED', g.orderId = :orderId, g.reservedUntil = :reservedUntil " +
           "WHERE g.id = :giftId AND (g.status = 'AVAILABLE' OR (g.status = 'RESERVED' AND g.reservedUntil < :now))")
    int reserveGiftAtomically(
            @Param("giftId") String giftId,
            @Param("orderId") String orderId,
            @Param("reservedUntil") LocalDateTime reservedUntil,
            @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE CustomerGift g SET g.status = 'USED', g.usedAt = :now, g.orderId = :orderId " +
           "WHERE g.id = :giftId AND (g.status = 'RESERVED' OR g.status = 'AVAILABLE') AND (g.orderId = :orderId OR g.orderId IS NULL)")
    int settleGiftAtomically(
            @Param("giftId") String giftId,
            @Param("orderId") String orderId,
            @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE CustomerGift g SET g.status = 'AVAILABLE', g.orderId = NULL, g.reservedUntil = NULL, g.usedAt = NULL " +
           "WHERE (g.orderId = :orderId OR g.orderId = :orderCode) AND g.status IN ('RESERVED', 'USED')")
    int releaseGiftsForOrder(@Param("orderId") String orderId, @Param("orderCode") String orderCode);
}
