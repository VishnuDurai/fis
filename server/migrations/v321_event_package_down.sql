-- SREC FIS V3.2.1 — Schema Migration (DOWN / Rollback)
-- Safe, isolated rollback for V3.2.1 additions

DROP TABLE IF EXISTS event_design_packages;

-- Safely remove additive columns if needed
SET @exist_ver = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_generated_documents' AND COLUMN_NAME = 'version');
SET @sql_ver = IF(@exist_ver > 0, 'ALTER TABLE event_generated_documents DROP COLUMN version', 'SELECT 1');
PREPARE stmt_ver FROM @sql_ver;
EXECUTE stmt_ver;
DEALLOCATE PREPARE stmt_ver;

SET @exist_latest = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_generated_documents' AND COLUMN_NAME = 'is_latest');
SET @sql_latest = IF(@exist_latest > 0, 'ALTER TABLE event_generated_documents DROP COLUMN is_latest', 'SELECT 1');
PREPARE stmt_latest FROM @sql_latest;
EXECUTE stmt_latest;
DEALLOCATE PREPARE stmt_latest;

SET @exist_pkg = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_generated_documents' AND COLUMN_NAME = 'package_id');
SET @sql_pkg = IF(@exist_pkg > 0, 'ALTER TABLE event_generated_documents DROP COLUMN package_id', 'SELECT 1');
PREPARE stmt_pkg FROM @sql_pkg;
EXECUTE stmt_pkg;
DEALLOCATE PREPARE stmt_pkg;

SET @exist_stat = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_generated_documents' AND COLUMN_NAME = 'status');
SET @sql_stat = IF(@exist_stat > 0, 'ALTER TABLE event_generated_documents DROP COLUMN status', 'SELECT 1');
PREPARE stmt_stat FROM @sql_stat;
EXECUTE stmt_stat;
DEALLOCATE PREPARE stmt_stat;
