-- Flyway Migration V3: Relax legacy column points in loyalty_transactions
-- Engine: MySQL 8.0 / Aurora RDS MySQL
-- Prevents "Field 'points' doesn't have a default value" when inserting new transactions

ALTER TABLE loyalty_transactions MODIFY COLUMN points INT NULL DEFAULT 0;
