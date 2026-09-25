package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, String> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<Voucher> findByOrderByCreatedAtDesc();

    @Query("SELECT v FROM Voucher v WHERE v.isActive = true AND v.isPublic = true " +
           "AND (v.startDate IS NULL OR v.startDate <= :now) " +
           "AND (v.endDate IS NULL OR v.endDate >= :now) " +
           "AND (v.usageLimit IS NULL OR v.usedCount < v.usageLimit) " +
           "ORDER BY v.createdAt DESC")
    List<Voucher> findActivePublicVouchers(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE Voucher v SET v.usedCount = v.usedCount + 1, v.updatedAt = :now " +
           "WHERE v.id = :id AND (v.usageLimit IS NULL OR v.usedCount < v.usageLimit)")
    int incrementUsedCount(@Param("id") String id, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE Voucher v SET v.usedCount = CASE WHEN v.usedCount > 0 THEN v.usedCount - 1 ELSE 0 END, v.updatedAt = :now WHERE v.id = :id")
    int decrementUsedCount(@Param("id") String id, @Param("now") LocalDateTime now);
}
