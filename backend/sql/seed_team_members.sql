-- ============================================================
-- Team Agneto Dashboard — Seed Team Members
-- Run after schema.sql to populate the team roster.
--
--   mysql -u dashboard_user -p team_agneto_db < sql/seed_team_members.sql
--
-- Notes:
--   - employee_id format: AGN-XXX (unique, never reused)
--   - email format: firstname.lastname@agneto.com
--   - nick_name: preferred short name shown on the dashboard
--   - Use 1900-MM-DD for birthday if birth year is unknown
--   - Set is_active = 0 for former members
-- ============================================================

USE team_agneto_db;

-- Remove placeholder admin row inserted by schema.sql
DELETE FROM team_members WHERE employee_id = 'AGN-000';

-- ─── Insert Team Agneto Members ──────────────────────────────

INSERT INTO team_members (employee_id, first_name, last_name, nick_name, email, role, birthday, is_active, joined_date)
VALUES
  ('AGN-001', 'Chandrasekhar', 'Peddineni',    'Chandra',  'chandrasekhar.peddineni@agneto.com',  'Software Developer', '1996-12-24', 1, '2026-01-05'),
  ('AGN-002', 'Shravan',       'Sailada',       'Shravan',  'shravan.sailada@agneto.com',           'Software Developer', '1900-07-22', 1, '2023-03-01'),
  ('AGN-003', 'Sakshi',        'Kherdeker',     'Sakshi',   'sakshi.kherdeker@agneto.com',          'Software Developer', '1900-11-05', 1, '2022-06-15'),
  ('AGN-004', 'Srilekha',      'Vinjamoori',    'Sri',      'srilekha.vinjamoori@agneto.com',       'Software Developer', '1900-01-30', 1, '2023-08-20'),
  ('AGN-005', 'Pydi',          'Adapa',         'Pydi',     'pydi.adapa@agneto.com',                'Software Developer', NULL,         1, '2024-01-08'),
  ('AGN-006', 'Shalini',       'Sekhar',        'Shalini',  'shalini.sekhar@agneto.com',            'Software Developer', NULL,         1, '2024-01-08'),
  ('AGN-007', 'Gunakumar',     'Jammula',       'Guna',     'gunakumar.jammula@agneto.com',         'Software Developer', NULL,         1, '2024-01-08'),
  ('AGN-008', 'Ayesha',        'Rehman',        'Ayesha',   'ayesha.rehman@agneto.com',             'Product Manager',    NULL,         1, '2024-01-08'),
  ('AGN-009', 'Rahul',         'Ravi',          'Rahul',    'rahul.ravi@agneto.com',                'Lead Developer',     NULL,         1, '2024-01-08'),
  ('AGN-010', 'Sathish',       'Veeraraghavan', 'Sathish',  'sathish.veeraraghavan@agneto.com',     'Delivery Manager',   NULL,         1, '2024-01-08'),
  ('AGN-011', 'Subbulakshmi',  'Arunachalam',   'Subbu',    'subbulakshmi.arunachalam@agneto.com',  'QA Lead',            NULL,         1, '2024-01-08'),
  ('AGN-012', 'Anifa',         'Noorjahan',     'Anifa',    'anifa.noorjahan@agneto.com',           'QA Engineer',        NULL,         1, '2024-01-08'),
  ('AGN-013', 'Santhiya',      'Murugunathan',  'Santhiya', 'santhiya.murugunathan@agneto.com',     'QA Engineer',        NULL,         1, '2024-01-08');

SELECT CONCAT('Seeded ', COUNT(*), ' team members') AS status FROM team_members;
