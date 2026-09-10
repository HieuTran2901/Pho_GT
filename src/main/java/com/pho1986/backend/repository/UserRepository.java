package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT u FROM User u WHERE u.role = 'CUSTOMER' " +
           "AND (:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR u.phone LIKE CONCAT('%', :search, '%')) " +
           "AND (:status IS NULL OR :status = '' OR u.status = :status) " +
           "ORDER BY u.createdAt DESC")
    List<User> searchCustomers(@Param("search") String search, @Param("status") String status);

    List<User> findByStatusIn(java.util.Collection<String> statuses);
}
