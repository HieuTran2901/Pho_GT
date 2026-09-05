package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, String> {

    Optional<PaymentTransaction> findByPaymentCode(String paymentCode);

    List<PaymentTransaction> findByOrderOrderCode(String orderCode);

    Optional<PaymentTransaction> findTopByOrderOrderCodeOrderByCreatedAtDesc(String orderCode);
}
