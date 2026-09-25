-- Flyway Migration V2: P0 Security & Settlement Architectural Remediation
-- Engine: MySQL 8.0 / Aurora RDS MySQL

-- 1. Orders: Capability token for Guest checkout and Refund Audit Trail
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS order_access_token_hash VARCHAR(64) NULL,
    ADD COLUMN IF NOT EXISTS refund_amount DOUBLE NULL,
    ADD COLUMN IF NOT EXISTS refunded_by VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS refund_reason VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS refund_ref VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS refunded_at DATETIME NULL;

-- Index for fast capability token lookup
CREATE INDEX IF NOT EXISTS idx_orders_access_token_hash ON orders(order_access_token_hash);

-- 2. Customer Gifts: Reservation TTL support
ALTER TABLE customer_gifts
    ADD COLUMN IF NOT EXISTS reserved_until DATETIME NULL;

-- 3. Voucher Redemptions Ledger (Anti-Double Spend & Idempotency)
CREATE TABLE IF NOT EXISTS voucher_redemptions (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    voucher_id VARCHAR(255) NOT NULL,
    order_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NULL,
    discount_amount DOUBLE NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'USED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_voucher_order UNIQUE (voucher_id, order_id),
    CONSTRAINT fk_voucher_redemptions_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
    CONSTRAINT fk_voucher_redemptions_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Clean duplicate loyalty transactions before adding unique constraint if needed
CREATE INDEX IF NOT EXISTS idx_loyalty_tx_order_type ON loyalty_transactions(order_id, type);
