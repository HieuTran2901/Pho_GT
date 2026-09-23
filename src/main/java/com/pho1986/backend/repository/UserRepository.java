package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);

    long countByRole(String role);
    long countByRoleAndStatus(String role, String status);

    @EntityGraph(attributePaths = {"loyaltyAccount", "tasteProfile"})
    @Query("SELECT u FROM User u WHERE u.role = 'CUSTOMER' " +
           "AND (:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR u.phone LIKE CONCAT('%', :search, '%')) " +
           "AND (:status IS NULL OR :status = '' OR u.status = :status) " +
           "ORDER BY u.createdAt DESC")
    List<User> searchCustomers(@Param("search") String search, @Param("status") String status);

    @EntityGraph(attributePaths = {"loyaltyAccount", "tasteProfile"})
    @Query(value = "SELECT u FROM User u LEFT JOIN u.loyaltyAccount la WHERE u.role = 'CUSTOMER' " +
           "AND (:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR u.phone LIKE CONCAT('%', :search, '%')) " +
           "AND (:statusFilter IS NULL OR :statusFilter = '' " +
           "     OR (:statusFilter = 'ACTIVE' AND UPPER(u.status) <> 'LOCKED' AND (u.lockedUntil IS NULL OR u.lockedUntil <= :now)) " +
           "     OR (:statusFilter = 'LOCKED' AND (UPPER(u.status) = 'LOCKED' OR (u.lockedUntil IS NOT NULL AND u.lockedUntil > :now))) " +
           "     OR (:statusFilter = 'LOCKED_PASSWORD' AND (UPPER(u.status) = 'LOCKED' OR (u.lockedUntil IS NOT NULL AND u.lockedUntil > :now)) AND (u.lockType IS NULL OR u.lockType NOT IN ('ADMIN_MANUAL', 'BLACKLISTED'))) " +
           "     OR (:statusFilter = 'LOCKED_ADMIN' AND (UPPER(u.status) = 'LOCKED' OR (u.lockedUntil IS NOT NULL AND u.lockedUntil > :now)) AND u.lockType IN ('ADMIN_MANUAL', 'BLACKLISTED'))) " +
           "AND (:tier IS NULL OR :tier = '' " +
           "     OR (:tier = 'DONG' AND (la IS NULL OR la.membershipTier IS NULL OR la.membershipTier = 'DONG')) " +
           "     OR (la.membershipTier = :tier)) " +
           "ORDER BY u.createdAt DESC",
           countQuery = "SELECT COUNT(u) FROM User u LEFT JOIN u.loyaltyAccount la WHERE u.role = 'CUSTOMER' " +
           "AND (:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR u.phone LIKE CONCAT('%', :search, '%')) " +
           "AND (:statusFilter IS NULL OR :statusFilter = '' " +
           "     OR (:statusFilter = 'ACTIVE' AND UPPER(u.status) <> 'LOCKED' AND (u.lockedUntil IS NULL OR u.lockedUntil <= :now)) " +
           "     OR (:statusFilter = 'LOCKED' AND (UPPER(u.status) = 'LOCKED' OR (u.lockedUntil IS NOT NULL AND u.lockedUntil > :now))) " +
           "     OR (:statusFilter = 'LOCKED_PASSWORD' AND (UPPER(u.status) = 'LOCKED' OR (u.lockedUntil IS NOT NULL AND u.lockedUntil > :now)) AND (u.lockType IS NULL OR u.lockType NOT IN ('ADMIN_MANUAL', 'BLACKLISTED'))) " +
           "     OR (:statusFilter = 'LOCKED_ADMIN' AND (UPPER(u.status) = 'LOCKED' OR (u.lockedUntil IS NOT NULL AND u.lockedUntil > :now)) AND u.lockType IN ('ADMIN_MANUAL', 'BLACKLISTED'))) " +
           "AND (:tier IS NULL OR :tier = '' " +
           "     OR (:tier = 'DONG' AND (la IS NULL OR la.membershipTier IS NULL OR la.membershipTier = 'DONG')) " +
           "     OR (la.membershipTier = :tier))")
    Page<User> searchCustomersPage(
            @Param("search") String search,
            @Param("statusFilter") String statusFilter,
            @Param("tier") String tier,
            @Param("now") LocalDateTime now,
            Pageable pageable);

    @EntityGraph(attributePaths = {"loyaltyAccount", "tasteProfile"})
    @Query("SELECT u FROM User u LEFT JOIN u.loyaltyAccount la WHERE u.role = 'CUSTOMER' " +
           "AND (:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR u.phone LIKE CONCAT('%', :search, '%')) " +
           "AND (:statusFilter IS NULL OR :statusFilter = '' " +
           "     OR (:statusFilter = 'ACTIVE' AND UPPER(u.status) <> 'LOCKED' AND (u.lockedUntil IS NULL OR u.lockedUntil <= :now)) " +
           "     OR (:statusFilter = 'LOCKED' AND (UPPER(u.status) = 'LOCKED' OR (u.lockedUntil IS NOT NULL AND u.lockedUntil > :now))) " +
           "     OR (:statusFilter = 'LOCKED_PASSWORD' AND (UPPER(u.status) = 'LOCKED' OR (u.lockedUntil IS NOT NULL AND u.lockedUntil > :now)) AND (u.lockType IS NULL OR u.lockType NOT IN ('ADMIN_MANUAL', 'BLACKLISTED'))) " +
           "     OR (:statusFilter = 'LOCKED_ADMIN' AND (UPPER(u.status) = 'LOCKED' OR (u.lockedUntil IS NOT NULL AND u.lockedUntil > :now)) AND u.lockType IN ('ADMIN_MANUAL', 'BLACKLISTED'))) " +
           "AND (:tier IS NULL OR :tier = '' " +
           "     OR (:tier = 'DONG' AND (la IS NULL OR la.membershipTier IS NULL OR la.membershipTier = 'DONG')) " +
           "     OR (la.membershipTier = :tier)) " +
           "ORDER BY u.createdAt DESC")
    List<User> searchCustomersList(
            @Param("search") String search,
            @Param("statusFilter") String statusFilter,
            @Param("tier") String tier,
            @Param("now") LocalDateTime now);

    List<User> findByStatusIn(java.util.Collection<String> statuses);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'CUSTOMER' AND (UPPER(u.status) = 'LOCKED' OR (u.lockedUntil IS NOT NULL AND u.lockedUntil > :now))")
    long countLockedCustomers(@Param("now") java.time.LocalDateTime now);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'CUSTOMER' AND (UPPER(u.status) = 'LOCKED' OR (u.lockedUntil IS NOT NULL AND u.lockedUntil > :now)) AND u.lockType IN ('ADMIN_MANUAL', 'BLACKLISTED')")
    long countAdminLockedCustomers(@Param("now") java.time.LocalDateTime now);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'CUSTOMER' AND UPPER(u.status) <> 'LOCKED' AND (u.lockedUntil IS NULL OR u.lockedUntil <= :now)")
    long countActiveCustomers(@Param("now") java.time.LocalDateTime now);

    @Query("SELECT COUNT(la) FROM LoyaltyAccount la WHERE la.user.role = 'CUSTOMER' AND la.membershipTier IN ('VANG', 'KIM_CUONG')")
    long countVipCustomers();
}
