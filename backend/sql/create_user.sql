-- ============================================================
-- Team Agneto Dashboard — Create Application DB User
-- Run as MySQL root before running schema.sql
--
--   mysql -u root -p < sql/create_user.sql
-- ============================================================

-- Replace 'your_db_password' with the actual password
-- matching DB_PASSWORD in your .env file

CREATE USER IF NOT EXISTS 'dashboard_user'@'localhost'
  IDENTIFIED BY 'your_db_password';

GRANT ALL PRIVILEGES ON team_agneto_db.* TO 'dashboard_user'@'localhost';

FLUSH PRIVILEGES;

SELECT 'dashboard_user created and granted privileges on team_agneto_db' AS status;
