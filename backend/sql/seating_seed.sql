-- Seating configuration: stores the shuffle seed so seating arrangements
-- persist across page refreshes and are consistent for all viewers.
-- Only one row (id = 1) is used; upserted on each shuffle.

CREATE TABLE IF NOT EXISTS seating_config (
  id         INT          NOT NULL DEFAULT 1 PRIMARY KEY,
  seed       INT          NOT NULL,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
