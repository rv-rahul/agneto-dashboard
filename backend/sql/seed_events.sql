-- ============================================================
-- Team Agneto Dashboard — Seed Events (Holidays + Team Events)
-- Run after schema.sql
--
--   mysql -u dashboard_user -p team_agneto_db < sql/seed_events.sql
-- ============================================================

USE team_agneto_db;

-- ─── 2026 US Federal Holidays ────────────────────────────────
INSERT INTO events (title, event_type, event_date, all_day, is_recurring, recur_rule, description)
VALUES
  ('New Year\'s Day',              'holiday', '2026-01-01', 1, 1, 'Annually', 'US Federal Holiday'),
  ('Martin Luther King Jr. Day',   'holiday', '2026-01-19', 1, 1, 'Annually (3rd Monday Jan)', 'US Federal Holiday'),
  ('Presidents\' Day',             'holiday', '2026-02-16', 1, 1, 'Annually (3rd Monday Feb)', 'US Federal Holiday'),
  ('Memorial Day',                 'holiday', '2026-05-25', 1, 1, 'Annually (Last Monday May)', 'US Federal Holiday'),
  ('Juneteenth',                   'holiday', '2026-06-19', 1, 1, 'Annually', 'US Federal Holiday'),
  ('Independence Day',             'holiday', '2026-07-04', 1, 1, 'Annually', 'US Federal Holiday'),
  ('Labor Day',                    'holiday', '2026-09-07', 1, 1, 'Annually (1st Monday Sep)', 'US Federal Holiday'),
  ('Columbus Day',                 'holiday', '2026-10-12', 1, 1, 'Annually (2nd Monday Oct)', 'US Federal Holiday'),
  ('Veterans Day',                 'holiday', '2026-11-11', 1, 1, 'Annually', 'US Federal Holiday'),
  ('Thanksgiving Day',             'holiday', '2026-11-26', 1, 1, 'Annually (4th Thursday Nov)', 'US Federal Holiday'),
  ('Christmas Day',                'holiday', '2026-12-25', 1, 1, 'Annually', 'US Federal Holiday');

-- ─── Sample Team Events ──────────────────────────────────────
-- Replace or extend with real team events.
INSERT INTO events (title, event_type, event_date, end_date, all_day, start_time, end_time, is_recurring, recur_rule, description)
VALUES
  ('Team Sprint Planning',   'event', '2026-03-02', NULL,         0, '10:00:00', '11:00:00', 1, 'Bi-weekly Monday', 'Sprint kickoff meeting'),
  ('Quarterly Team Review',  'event', '2026-03-31', NULL,         0, '14:00:00', '16:00:00', 0, NULL,               'Q1 2026 team review'),
  ('Team Offsite',           'event', '2026-04-15', '2026-04-16', 1, NULL,       NULL,       0, NULL,               'Annual team offsite — location TBD');

SELECT CONCAT('Seeded ', COUNT(*), ' events') AS status FROM events;
