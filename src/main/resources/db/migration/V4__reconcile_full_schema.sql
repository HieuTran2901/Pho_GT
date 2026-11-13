-- Flyway Migration V4: Reconcile Full Schema with JPA Entities (ISSUE-DATA-01 & ISSUE-DATA-02)
-- Engine: MySQL 8.0 / Aurora RDS MySQL
-- Idempotent migration safe for both clean Flyway initialization and legacy ddl-auto: update databases.

-- 1. Four missing core tables in Flyway baseline
CREATE TABLE IF NOT EXISTS dining_tables (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    floor INT NOT NULL DEFAULT 1,
    capacity INT NOT NULL DEFAULT 4,
    zone VARCHAR(50),
    zone_name VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    is_vip BOOLEAN NOT NULL DEFAULT FALSE,
    description VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dining_tables_floor_status (floor, status),
    INDEX idx_dining_tables_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_gateway_configs (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    maintenance_message VARCHAR(255),
    updated_at DATETIME,
    updated_by VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS security_blacklists (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    target_type VARCHAR(20) NOT NULL,
    target_value VARCHAR(100) NOT NULL,
    reason VARCHAR(255),
    banned_by VARCHAR(50),
    expires_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_target_type_value (target_type, target_value),
    INDEX idx_target_value (target_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS loyalty_rewards (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    points_required INT NOT NULL,
    reward_type VARCHAR(30) NOT NULL,
    discount_value DOUBLE NOT NULL DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    validity_days INT NOT NULL DEFAULT 30,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_loyalty_rewards_lookup (is_active, points_required)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Reconcile addresses table (JPA Address entity maps to 'addresses', V1 created 'user_addresses')
CREATE TABLE IF NOT EXISTS addresses (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    ward VARCHAR(100),
    district VARCHAR(100) NOT NULL DEFAULT '',
    city VARCHAR(100) NOT NULL DEFAULT 'Hà Nội',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_address_user (user_id, is_default, created_at),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_reconcile_v4 $$
CREATE PROCEDURE sp_reconcile_v4()
BEGIN
    DECLARE v_has_user_addresses INT DEFAULT 0;
    DECLARE v_has_col INT DEFAULT 0;
    DECLARE v_has_old_col INT DEFAULT 0;

    -- Migrate rows from legacy user_addresses table if present without dropping data
    SELECT COUNT(*) INTO v_has_user_addresses
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_addresses';

    IF v_has_user_addresses > 0 THEN
        INSERT IGNORE INTO addresses (id, user_id, recipient_name, phone, address_line, ward, district, city, is_default, created_at)
        SELECT id, user_id, receiver_name, receiver_phone, address_line, ward,
               COALESCE(district, ''), COALESCE(city, 'Hà Nội'), COALESCE(is_default, FALSE), COALESCE(created_at, NOW())
        FROM user_addresses;
    END IF;

    -- categories.created_at
    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'created_at';
    IF v_has_col = 0 THEN
        ALTER TABLE categories ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- dishes: portion, tag, tag_icon, ingredients, image_url length
    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dishes' AND COLUMN_NAME = 'portion';
    IF v_has_col = 0 THEN
        ALTER TABLE dishes ADD COLUMN portion VARCHAR(50) NULL;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dishes' AND COLUMN_NAME = 'tag';
    IF v_has_col = 0 THEN
        ALTER TABLE dishes ADD COLUMN tag VARCHAR(50) NULL;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dishes' AND COLUMN_NAME = 'tag_icon';
    IF v_has_col = 0 THEN
        ALTER TABLE dishes ADD COLUMN tag_icon VARCHAR(50) NULL;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dishes' AND COLUMN_NAME = 'ingredients';
    IF v_has_col = 0 THEN
        ALTER TABLE dishes ADD COLUMN ingredients TEXT NULL;
    END IF;

    ALTER TABLE dishes MODIFY COLUMN image_url VARCHAR(1000) NULL;

    -- users: firebase_uid, auth_provider, avatar_url
    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'firebase_uid';
    IF v_has_col = 0 THEN
        ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(128) NULL UNIQUE;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'auth_provider';
    IF v_has_col = 0 THEN
        ALTER TABLE users ADD COLUMN auth_provider VARCHAR(30) NOT NULL DEFAULT 'PASSWORD';
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar_url';
    IF v_has_col = 0 THEN
        ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL;
    END IF;

    -- orders & order_items column type alignments
    ALTER TABLE orders MODIFY COLUMN table_number VARCHAR(50) NULL;
    ALTER TABLE orders MODIFY COLUMN refunded_by VARCHAR(100) NULL;
    ALTER TABLE order_items MODIFY COLUMN dish_id VARCHAR(50) NULL;
    ALTER TABLE order_items MODIFY COLUMN customized_options TEXT NULL;

    -- customer_gifts: dish_id, image
    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customer_gifts' AND COLUMN_NAME = 'dish_id';
    IF v_has_col = 0 THEN
        ALTER TABLE customer_gifts ADD COLUMN dish_id VARCHAR(50) NULL;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customer_gifts' AND COLUMN_NAME = 'image';
    IF v_has_col = 0 THEN
        ALTER TABLE customer_gifts ADD COLUMN image VARCHAR(500) NULL;
        SELECT COUNT(*) INTO v_has_old_col FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customer_gifts' AND COLUMN_NAME = 'image_url';
        IF v_has_old_col > 0 THEN
            UPDATE customer_gifts SET image = image_url WHERE image IS NULL;
        END IF;
    END IF;

    -- loyalty_accounts: total_points, total_spent, total_orders_count
    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loyalty_accounts' AND COLUMN_NAME = 'total_points';
    IF v_has_col = 0 THEN
        ALTER TABLE loyalty_accounts ADD COLUMN total_points INT NOT NULL DEFAULT 50;
        SELECT COUNT(*) INTO v_has_old_col FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loyalty_accounts' AND COLUMN_NAME = 'total_earned_points';
        IF v_has_old_col > 0 THEN
            UPDATE loyalty_accounts SET total_points = COALESCE(total_earned_points, 50);
        END IF;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loyalty_accounts' AND COLUMN_NAME = 'total_spent';
    IF v_has_col = 0 THEN
        ALTER TABLE loyalty_accounts ADD COLUMN total_spent DOUBLE NOT NULL DEFAULT 0.0;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loyalty_accounts' AND COLUMN_NAME = 'total_orders_count';
    IF v_has_col = 0 THEN
        ALTER TABLE loyalty_accounts ADD COLUMN total_orders_count INT NOT NULL DEFAULT 0;
    END IF;

    -- loyalty_transactions: points_change, balance_after
    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loyalty_transactions' AND COLUMN_NAME = 'points_change';
    IF v_has_col = 0 THEN
        ALTER TABLE loyalty_transactions ADD COLUMN points_change INT NOT NULL DEFAULT 0;
        UPDATE loyalty_transactions SET points_change = COALESCE(points, 0);
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loyalty_transactions' AND COLUMN_NAME = 'balance_after';
    IF v_has_col = 0 THEN
        ALTER TABLE loyalty_transactions ADD COLUMN balance_after INT NOT NULL DEFAULT 0;
    END IF;

    -- payment_transactions: 7 missing columns in V1
    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transactions' AND COLUMN_NAME = 'qr_code_url';
    IF v_has_col = 0 THEN
        ALTER TABLE payment_transactions ADD COLUMN qr_code_url VARCHAR(500) NULL;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transactions' AND COLUMN_NAME = 'bank_bin';
    IF v_has_col = 0 THEN
        ALTER TABLE payment_transactions ADD COLUMN bank_bin VARCHAR(20) NULL;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transactions' AND COLUMN_NAME = 'bank_name';
    IF v_has_col = 0 THEN
        ALTER TABLE payment_transactions ADD COLUMN bank_name VARCHAR(50) NULL;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transactions' AND COLUMN_NAME = 'bank_account_no';
    IF v_has_col = 0 THEN
        ALTER TABLE payment_transactions ADD COLUMN bank_account_no VARCHAR(30) NULL;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transactions' AND COLUMN_NAME = 'bank_account_name';
    IF v_has_col = 0 THEN
        ALTER TABLE payment_transactions ADD COLUMN bank_account_name VARCHAR(100) NULL;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transactions' AND COLUMN_NAME = 'transfer_content';
    IF v_has_col = 0 THEN
        ALTER TABLE payment_transactions ADD COLUMN transfer_content VARCHAR(100) NULL;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_transactions' AND COLUMN_NAME = 'version';
    IF v_has_col = 0 THEN
        ALTER TABLE payment_transactions ADD COLUMN version BIGINT NULL DEFAULT 0;
    END IF;

    -- refresh_tokens: align is_revoked -> revoked
    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'refresh_tokens' AND COLUMN_NAME = 'revoked';
    IF v_has_col = 0 THEN
        SELECT COUNT(*) INTO v_has_old_col FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'refresh_tokens' AND COLUMN_NAME = 'is_revoked';
        IF v_has_old_col > 0 THEN
            ALTER TABLE refresh_tokens CHANGE COLUMN is_revoked revoked BOOLEAN NOT NULL DEFAULT FALSE;
        ELSE
            ALTER TABLE refresh_tokens ADD COLUMN revoked BOOLEAN NOT NULL DEFAULT FALSE;
        END IF;
    END IF;

    -- taste_profiles: align columns with TasteProfile entity
    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'taste_profiles' AND COLUMN_NAME = 'broth_type';
    IF v_has_col = 0 THEN
        ALTER TABLE taste_profiles ADD COLUMN broth_type VARCHAR(30) NOT NULL DEFAULT 'DAM_DA';
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'taste_profiles' AND COLUMN_NAME = 'onion_style';
    IF v_has_col = 0 THEN
        ALTER TABLE taste_profiles ADD COLUMN onion_style VARCHAR(30) NOT NULL DEFAULT 'NHIEU_HANH';
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'taste_profiles' AND COLUMN_NAME = 'herb_style';
    IF v_has_col = 0 THEN
        ALTER TABLE taste_profiles ADD COLUMN herb_style VARCHAR(30) NOT NULL DEFAULT 'DU_RAU';
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'taste_profiles' AND COLUMN_NAME = 'spicy_level';
    IF v_has_col = 0 THEN
        ALTER TABLE taste_profiles ADD COLUMN spicy_level INT NOT NULL DEFAULT 1;
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'taste_profiles' AND COLUMN_NAME = 'cruller_pref';
    IF v_has_col = 0 THEN
        ALTER TABLE taste_profiles ADD COLUMN cruller_pref VARCHAR(30) NOT NULL DEFAULT 'QUAY_GION';
    END IF;

    SELECT COUNT(*) INTO v_has_col FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'taste_profiles' AND COLUMN_NAME = 'custom_note';
    IF v_has_col = 0 THEN
        ALTER TABLE taste_profiles ADD COLUMN custom_note VARCHAR(255) NULL;
    END IF;
END $$

CALL sp_reconcile_v4() $$
DROP PROCEDURE IF EXISTS sp_reconcile_v4 $$

DELIMITER ;
