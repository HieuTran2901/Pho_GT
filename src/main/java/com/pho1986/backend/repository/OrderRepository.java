package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    @Override
    @EntityGraph(attributePaths = {"items", "user"})
    Optional<Order> findById(String id);

    @EntityGraph(attributePaths = {"items", "user"})
    Optional<Order> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    @EntityGraph(attributePaths = {"items", "user"})
    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

    @EntityGraph(attributePaths = {"items", "user"})
    Optional<Order> findFirstByUserIdOrderByCreatedAtDesc(String userId);

    @EntityGraph(attributePaths = {"items", "user"})
    List<Order> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"items", "user"})
    List<Order> findByStatusOrderByCreatedAtDesc(String status);

    // --- CÁC TRUY VẤN TỔNG HỢP SIÊU TỐC TRÊN CSDL (DRAGON AGGREGATIONS) ---

    long countByStatus(String status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status IN :statuses")
    long countByStatusIn(@Param("statuses") List<String> statuses);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0.0) FROM Order o WHERE o.paymentStatus = 'PAID' OR o.status = 'COMPLETED'")
    Double sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0.0) FROM Order o WHERE o.createdAt >= :since AND (o.paymentStatus = 'PAID' OR o.status = 'COMPLETED')")
    Double sumRevenueSince(@Param("since") LocalDateTime since);
}
