-- ============================================================
-- Team Agneto Dashboard — MySQL Schema
-- Target: MySQL 8.0+
--
-- Setup Instructions:
--   1. Login as root:  mysql -u root -p
--   2. Run this file:  source /path/to/sql/schema.sql
--      OR from shell:  mysql -u root -p < sql/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS team_agneto_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE team_agneto_db;

-- ─── Create application user (run as root) ───────────────────
-- Uncomment the lines below if you haven't created the user yet:
-- CREATE USER IF NOT EXISTS 'dashboard_user'@'localhost' IDENTIFIED BY 'your_db_password';
-- GRANT ALL PRIVILEGES ON team_agneto_db.* TO 'dashboard_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ─── weather_data ───────────────────────────────────────────
-- Stores periodic snapshots from OpenWeatherMap.
-- Purged automatically by cleanupJob daily (default: 7 days).
CREATE TABLE IF NOT EXISTS weather_data (
  id             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  city           VARCHAR(100)     NOT NULL,
  country        VARCHAR(10)      NOT NULL,
  temp_f         DECIMAL(5,2)     NOT NULL COMMENT 'Temperature °F (imperial) or °C (metric)',
  feels_like_f   DECIMAL(5,2)     NOT NULL,
  temp_min_f     DECIMAL(5,2)     NOT NULL,
  temp_max_f     DECIMAL(5,2)     NOT NULL,
  humidity       TINYINT UNSIGNED NOT NULL COMMENT 'Percent 0–100',
  pressure       SMALLINT UNSIGNED NOT NULL COMMENT 'hPa',
  description    VARCHAR(255)     NOT NULL,
  icon_code      VARCHAR(10)      NOT NULL COMMENT 'OWM icon code e.g. 01d',
  wind_speed_mph DECIMAL(5,2)     NOT NULL,
  wind_deg       SMALLINT UNSIGNED NOT NULL,
  visibility_mi  DECIMAL(6,2)     NULL,
  sunrise_utc    INT UNSIGNED     NOT NULL COMMENT 'Unix timestamp',
  sunset_utc     INT UNSIGNED     NOT NULL COMMENT 'Unix timestamp',
  fetched_at     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_fetched_at (fetched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── system_stats ───────────────────────────────────────────
-- Periodic snapshots of Raspberry Pi resource usage.
-- Purged automatically (default: 3 days).
CREATE TABLE IF NOT EXISTS system_stats (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  cpu_percent   DECIMAL(5,2)  NOT NULL COMMENT '0.00–100.00',
  ram_percent   DECIMAL(5,2)  NOT NULL,
  disk_percent  DECIMAL(5,2)  NOT NULL,
  cpu_temp_c    DECIMAL(5,2)  NULL     COMMENT 'Celsius; NULL if not on Pi',
  ram_used_mb   INT UNSIGNED  NOT NULL,
  ram_total_mb  INT UNSIGNED  NOT NULL,
  disk_used_gb  DECIMAL(8,2)  NOT NULL,
  disk_total_gb DECIMAL(8,2)  NOT NULL,
  captured_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_captured_at (captured_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── team_members ───────────────────────────────────────────
-- Static team roster. Update directly via MySQL or add a
-- future admin endpoint.
CREATE TABLE IF NOT EXISTS team_members (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  full_name   VARCHAR(255)  NOT NULL,
  email       VARCHAR(255)  NULL,
  role        VARCHAR(100)  NULL,
  birthday    DATE          NULL     COMMENT 'Use 1900-MM-DD if year unknown',
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  joined_date DATE          NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email (email),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── events ─────────────────────────────────────────────────
-- Free-form upcoming events, holidays, and birthdays.
-- Full CRUD via /api/events endpoints.
CREATE TABLE IF NOT EXISTS events (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  title        VARCHAR(255)  NOT NULL,
  description  TEXT          NULL,
  event_type   ENUM('event','holiday','birthday') NOT NULL DEFAULT 'event',
  event_date   DATE          NOT NULL,
  end_date     DATE          NULL     COMMENT 'For multi-day events; NULL = single day',
  all_day      TINYINT(1)    NOT NULL DEFAULT 1,
  start_time   TIME          NULL     COMMENT 'Populated when all_day = 0',
  end_time     TIME          NULL     COMMENT 'Populated when all_day = 0',
  is_recurring TINYINT(1)    NOT NULL DEFAULT 0,
  recur_rule   VARCHAR(100)  NULL     COMMENT 'Human-readable e.g. Annually',
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_event_date (event_date),
  INDEX idx_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── notifications_log ──────────────────────────────────────
-- Audit trail: logged each time Angular polls /api/notifications/active
-- and a notification is currently active.
CREATE TABLE IF NOT EXISTS notifications_log (
  id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  notification_type VARCHAR(50)   NOT NULL COMMENT 'checkin|checkout|timesheet|lunch',
  fired_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  client_ip         VARCHAR(45)   NULL,
  PRIMARY KEY (id),
  INDEX idx_fired_at (fired_at),
  INDEX idx_type_fired (notification_type, fired_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── api_call_log ───────────────────────────────────────────
-- Logs all outbound API calls (OpenWeatherMap etc.) for debugging
-- and quota tracking. Purged automatically (default: 30 days).
CREATE TABLE IF NOT EXISTS api_call_log (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  service       VARCHAR(50)   NOT NULL COMMENT 'e.g. openweathermap',
  endpoint      VARCHAR(500)  NOT NULL,
  status_code   SMALLINT      NULL,
  response_ms   INT UNSIGNED  NULL     COMMENT 'Round-trip milliseconds',
  success       TINYINT(1)    NOT NULL DEFAULT 1,
  error_message TEXT          NULL,
  called_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_called_at (called_at),
  INDEX idx_service (service)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Seed: Placeholder team member ──────────────────────────
-- Replace with actual team members.
INSERT IGNORE INTO team_members (full_name, email, role, is_active)
VALUES ('Team Agneto Admin', 'admin@teamagneto.local', 'Admin', 1);
