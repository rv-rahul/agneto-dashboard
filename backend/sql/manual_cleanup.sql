-- ============================================================
-- Team Agneto Dashboard — Manual Cleanup Script
-- Run this to manually purge old data outside of the nightly
-- cleanupJob cron (runs daily at 2 AM CST automatically).
--
--   mysql -u dashboard_user -p team_agneto_db < sql/manual_cleanup.sql
--
-- Retention defaults (match .env):
--   WEATHER_RETAIN_DAYS     = 7
--   SYSTEM_STATS_RETAIN_DAYS = 3
--   API_LOG_RETAIN_DAYS     = 30
--   notifications_log       = 30 (hardcoded in cleanupJob.js)
-- ============================================================

USE team_agneto_db;

-- Adjust the INTERVAL values below to match your .env retention settings.

-- ─── Weather data (7 days) ───────────────────────────────────
DELETE FROM weather_data
WHERE fetched_at < NOW() - INTERVAL 7 DAY;

SELECT ROW_COUNT() AS weather_rows_deleted;

-- ─── System stats (3 days) ───────────────────────────────────
DELETE FROM system_stats
WHERE captured_at < NOW() - INTERVAL 3 DAY;

SELECT ROW_COUNT() AS system_stats_rows_deleted;

-- ─── API call log (30 days) ──────────────────────────────────
DELETE FROM api_call_log
WHERE called_at < NOW() - INTERVAL 30 DAY;

SELECT ROW_COUNT() AS api_call_log_rows_deleted;

-- ─── Notifications log (30 days) ─────────────────────────────
DELETE FROM notifications_log
WHERE fired_at < NOW() - INTERVAL 30 DAY;

SELECT ROW_COUNT() AS notifications_log_rows_deleted;
