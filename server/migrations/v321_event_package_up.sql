-- SREC FIS V3.2.1 — Schema Migration (UP)
-- Safe, additive migration for Event Design History & One-Click Complete Event Package

CREATE TABLE IF NOT EXISTS event_design_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  event_title VARCHAR(255) NOT NULL,
  staff_id VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  poster_template VARCHAR(20) DEFAULT 'P01',
  invitation_template VARCHAR(20) DEFAULT 'I01',
  certificate_template VARCHAR(20) DEFAULT 'C01',
  participant_count INT DEFAULT 0,
  cert_range_start VARCHAR(100) DEFAULT NULL,
  cert_range_end VARCHAR(100) DEFAULT NULL,
  package_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) DEFAULT NULL,
  generation_status VARCHAR(50) DEFAULT 'COMPLETED',
  poster_status VARCHAR(50) DEFAULT 'SUCCESS',
  invitation_status VARCHAR(50) DEFAULT 'SUCCESS',
  certificate_status VARCHAR(50) DEFAULT 'SUCCESS',
  summary_status VARCHAR(50) DEFAULT 'SUCCESS',
  error_details TEXT DEFAULT NULL,
  idempotency_key VARCHAR(100) DEFAULT NULL,
  metadata_json TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pkg_event_staff (event_id, staff_id),
  UNIQUE KEY uq_idempotency_key (idempotency_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure file_path is nullable on event_generated_documents (idempotent)
SET @fp_nullable = (SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_generated_documents' AND COLUMN_NAME = 'file_path');
SET @sql_fp = IF(@fp_nullable = 'NO', 'ALTER TABLE event_generated_documents MODIFY COLUMN file_path VARCHAR(500) NULL DEFAULT NULL', 'SELECT 1');
PREPARE stmt_fp FROM @sql_fp;
EXECUTE stmt_fp;
DEALLOCATE PREPARE stmt_fp;

-- Ensure unique constraint on idempotency_key (idempotent)
SET @uidx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_design_packages' AND INDEX_NAME = 'uq_idempotency_key');
SET @sql_uidx = IF(@uidx_exists = 0, 'ALTER TABLE event_design_packages ADD UNIQUE KEY uq_idempotency_key (idempotency_key)', 'SELECT 1');
PREPARE stmt_uidx FROM @sql_uidx;
EXECUTE stmt_uidx;
DEALLOCATE PREPARE stmt_uidx;


-- Additive columns to event_generated_documents
-- Note: MySQL 8.0+ supports IF NOT EXISTS for columns in ALTER TABLE or handled via safe procedural wrapper
SET @exist_ver = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_generated_documents' AND COLUMN_NAME = 'version');
SET @sql_ver = IF(@exist_ver = 0, 'ALTER TABLE event_generated_documents ADD COLUMN version INT DEFAULT 1', 'SELECT 1');
PREPARE stmt_ver FROM @sql_ver;
EXECUTE stmt_ver;
DEALLOCATE PREPARE stmt_ver;

SET @exist_latest = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_generated_documents' AND COLUMN_NAME = 'is_latest');
SET @sql_latest = IF(@exist_latest = 0, 'ALTER TABLE event_generated_documents ADD COLUMN is_latest TINYINT(1) DEFAULT 1', 'SELECT 1');
PREPARE stmt_latest FROM @sql_latest;
EXECUTE stmt_latest;
DEALLOCATE PREPARE stmt_latest;

SET @exist_pkg = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_generated_documents' AND COLUMN_NAME = 'package_id');
SET @sql_pkg = IF(@exist_pkg = 0, 'ALTER TABLE event_generated_documents ADD COLUMN package_id INT DEFAULT NULL', 'SELECT 1');
PREPARE stmt_pkg FROM @sql_pkg;
EXECUTE stmt_pkg;
DEALLOCATE PREPARE stmt_pkg;

SET @exist_stat = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_generated_documents' AND COLUMN_NAME = 'status');
SET @sql_stat = IF(@exist_stat = 0, 'ALTER TABLE event_generated_documents ADD COLUMN status VARCHAR(50) DEFAULT "COMPLETED"', 'SELECT 1');
PREPARE stmt_stat FROM @sql_stat;
EXECUTE stmt_stat;
DEALLOCATE PREPARE stmt_stat;
