# CLAUDE.md — Team Agneto Dashboard Backend

## Project Overview

**Team Agneto Raspberry Pi 4 Dashboard Backend** is a Node.js/Express RESTful API server designed to power a team monitoring and notification dashboard. It runs on a Raspberry Pi 4 and serves an Angular frontend with real-time system stats, weather data, team info, events management, and time-based notifications.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js >= 20.0.0 |
| Framework | Express.js 4.21.1 |
| Database | MySQL 8.0+ (mysql2 3.11.3, promise-based) |
| Security | helmet 8.0.0, cors 2.8.5, express-validator 7.2.0 |
| Date/Time | luxon 3.5.0 (timezone-aware, DST-safe) |
| HTTP Client | axios 1.7.7 (OpenWeatherMap API) |
| Cron Jobs | node-cron 3.0.3 |
| Logging | winston 3.15.0 |
| Config | dotenv 16.4.5 |
| Dev | nodemon 3.1.7 |

---

## Project Structure

```
dashboard-backend/
├── sql/
│   └── schema.sql               # MySQL schema (MySQL 8.0+, utf8mb4)
├── src/
│   ├── app.js                   # Express app setup: middleware + routes
│   ├── server.js                # Bootstrap: DB test → HTTP server → cron jobs
│   ├── config/
│   │   ├── constants.js         # TEAM_NAME, TIMEZONE, NOTIFICATION_WINDOWS
│   │   ├── database.js          # Singleton MySQL pool + query() wrapper
│   │   └── logger.js            # Winston logger (console + file)
│   ├── middleware/
│   │   ├── auth.js              # JWT placeholder (currently no-op)
│   │   ├── errorHandler.js      # AppError class + global error middleware
│   │   └── notFound.js          # 404 handler
│   ├── routes/
│   │   ├── index.js             # Aggregates all route modules under /api
│   │   ├── time.routes.js
│   │   ├── weather.routes.js
│   │   ├── systemStats.routes.js
│   │   ├── team.routes.js
│   │   ├── events.routes.js
│   │   └── notifications.routes.js
│   ├── controllers/             # Thin layer: parse req → call service → send res
│   │   ├── time.controller.js
│   │   ├── weather.controller.js
│   │   ├── systemStats.controller.js
│   │   ├── team.controller.js
│   │   ├── events.controller.js
│   │   └── notifications.controller.js
│   ├── services/                # Business logic + DB queries
│   │   ├── weather.service.js
│   │   ├── systemStats.service.js
│   │   ├── team.service.js
│   │   ├── events.service.js
│   │   └── notifications.service.js
│   ├── validators/
│   │   └── events.validator.js  # express-validator rules for events CRUD
│   └── jobs/
│       ├── index.js             # Starts all three cron jobs at server startup
│       ├── weatherJob.js        # Every 30 min: fetch OWM + store in DB
│       ├── systemStatsJob.js    # Every 5 min: capture Pi resources + store in DB
│       └── cleanupJob.js        # Daily 2 AM CST: purge old records
├── .env.example                 # Environment variable template
├── .gitignore
├── API_DOCS.md                  # Full API reference
├── package.json
└── logs/                        # Runtime: error.log, combined.log
```

---

## NPM Scripts

```bash
npm start        # node src/server.js (production)
npm run dev      # nodemon src/server.js (development, auto-reload)
```

---

## Environment Variables (.env)

```env
# Server
NODE_ENV=development
PORT=3000

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=dashboard_user
DB_PASSWORD=your_db_password
DB_NAME=team_agneto_db
DB_POOL_LIMIT=10

# OpenWeatherMap (free key at openweathermap.org/api)
WEATHER_API_KEY=your_openweathermap_api_key
WEATHER_CITY=Dallas
WEATHER_COUNTRY=US
WEATHER_UNITS=imperial    # imperial=°F/mph | metric=°C/m/s

# Data Retention (days)
WEATHER_RETAIN_DAYS=7
SYSTEM_STATS_RETAIN_DAYS=3
API_LOG_RETAIN_DAYS=30

# CORS — '*' for dev; comma-separated origins for prod
# e.g. http://192.168.1.50:4200,http://dashboard.local
CORS_ORIGINS=*
```

---

## Database (MySQL 8.0+)

**Database name:** `team_agneto_db` (utf8mb4_unicode_ci)

**Setup:**
```bash
mysql -u root -p < sql/schema.sql
```

### Tables

| Table | Purpose | Retention |
|---|---|---|
| `weather_data` | OWM weather snapshots | 7 days (WEATHER_RETAIN_DAYS) |
| `system_stats` | Pi CPU/RAM/Disk snapshots | 3 days (SYSTEM_STATS_RETAIN_DAYS) |
| `team_members` | Static team roster | Manual |
| `events` | Events/holidays/birthdays (CRUD) | Manual |
| `notifications_log` | Audit: active notification hits | 30 days (hardcoded) |
| `api_call_log` | Outbound API call tracking | 30 days (API_LOG_RETAIN_DAYS) |

**Key schema notes:**
- DB stores UTC timestamps; conversion to CST happens at app layer via Luxon
- All queries use `mysql2/promise` with parameterized statements (`pool.execute()`) — no SQL injection risk
- `team_members.birthday` stores `1900-MM-DD` if year unknown

---

## API Endpoints

All endpoints return `{ success: true, data: <payload> }` or `{ success: false, error: "<message>" }`.

### Health Check (no auth)
```
GET /health
```

### Time
```
GET /api/time
```
Returns: iso_cst, iso_utc, epoch_ms, date_cst, time_cst, display_cst, day_of_week, is_weekday, timezone, utc_offset

### Weather
```
GET  /api/weather/current           # Latest snapshot from DB
GET  /api/weather/history?limit=48  # History (max 200)
POST /api/weather/refresh           # Force immediate OWM fetch
```

### System Stats
```
GET /api/system-stats/current        # Live read + stores snapshot
GET /api/system-stats/history?limit=12  # History (max 288)
```
Fields: cpu_percent, ram_percent, disk_percent, cpu_temp_c (null on non-Pi), ram_used_mb, ram_total_mb, disk_used_gb, disk_total_gb

### Team
```
GET /api/team    # team_name, member_count, members[]
```

### Events (full CRUD)
```
GET    /api/events               # ?type=event|holiday|birthday&upcoming=true
GET    /api/events/:id
POST   /api/events               # 201 Created
PUT    /api/events/:id
DELETE /api/events/:id
```
Fields: title (required, max 255), event_type (event|holiday|birthday), event_date (required, ISO8601), end_date, description (max 2000), all_day, start_time (HH:MM), end_time (HH:MM), is_recurring, recur_rule (max 100)

### Notifications
```
GET /api/notifications/schedule   # Full static schedule config
GET /api/notifications/active     # Currently active notifications (CST-based)
```
Angular polls `/api/notifications/active` every 30 seconds and shows dismissible modal alerts.

---

## Notification Windows (CST / America/Chicago)

| Type | Label | Days | Window |
|---|---|---|---|
| `checkin` | Daily Check-In Reminder | Mon–Fri | 09:01–09:05 |
| `checkout` | Daily Check-Out Reminder | Mon–Fri | 17:00–17:10 |
| `timesheet` | Submit Your Timesheet | Friday only | 16:00–16:15 |
| `lunch` | Lunch Break | Mon–Fri | 12:00–12:15 |

**Timezone handling note:** Luxon weekday is 1=Mon…7=Sun; constants use 0=Sun…6=Sat. The service converts with: `cstDay = (now.weekday === 7) ? 0 : now.weekday`

---

## Background Cron Jobs

| Job | Schedule | Action |
|---|---|---|
| `weatherJob.js` | Every 30 min (`*/30 * * * *`) + startup | Fetch OWM, store in `weather_data`, log to `api_call_log` |
| `systemStatsJob.js` | Every 5 min (`*/5 * * * *`) | Capture CPU/RAM/Disk/Temp, store in `system_stats` |
| `cleanupJob.js` | Daily 2 AM CST (`0 2 * * *`) | Purge old rows from weather_data, system_stats, api_call_log, notifications_log |

---

## Middleware Stack (app.js order)

1. `helmet()` — security headers
2. `cors()` — configurable via CORS_ORIGINS env
3. `express.json()` + `express.urlencoded()` — body parsing
4. `morgan('combined')` — HTTP logging to Winston
5. Routes (`/health`, `/api/*`)
6. `notFound` — 404 handler
7. `errorHandler` — global error handler (must be last)

---

## Error Handling Pattern

```js
// In any service or controller:
const { AppError } = require('../middleware/errorHandler');
throw new AppError('Event not found', 404);  // isOperational = true
```

- Operational errors (AppError): logged as warn, returned with real message
- Unexpected errors: logged as error, message hidden in production (500 "Internal server error")
- Validation errors (422): `{ success: false, errors: [{ field, msg }] }`

---

## System Stats Implementation Notes

- **CPU%:** Reads `/proc/stat` twice with 200ms gap on Linux/Pi; falls back to `os.loadavg()` on Windows
- **RAM%:** `os.freemem() / os.totalmem()` (works everywhere)
- **Disk%:** `df -k --output=size,used /` on Linux; returns 0 on Windows (skipped gracefully)
- **CPU Temp:** `/sys/class/thermal/thermal_zone0/temp` (Pi only); returns `null` on dev machines

---

## Key Constants (src/config/constants.js)

```js
TEAM_NAME: 'Team Agneto'
TIMEZONE: 'America/Chicago'  // Luxon handles DST automatically
```

---

## Authentication Status

- Currently: **no-op placeholder** — all routes are open
- `src/middleware/auth.js` has detailed comments for JWT implementation
- Future: install `jsonwebtoken`, add `JWT_SECRET` to .env, implement verify logic
- Security applied now: helmet, CORS, input validation, parameterized SQL

---

## Deployment on Raspberry Pi

1. Install Node.js 20 LTS
2. Copy project, run `npm install`
3. Create DB: `mysql -u root -p < sql/schema.sql`
4. Copy `.env.example` → `.env`, fill in DB password + OWM API key
5. Start: `npm start` or use PM2:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name dashboard-backend
   pm2 startup && pm2 save
   ```

---

## Design Patterns

- **Service Layer:** Business logic lives in `services/`, controllers are thin request/response wrappers
- **Singleton DB Pool:** `src/config/database.js` creates pool once, all modules share it via `query()`
- **Parameterized Queries:** All SQL uses `?` placeholders via `mysql2/promise`'s `execute()`
- **AppError Propagation:** Services throw `AppError`, controllers call `next(err)`, global handler catches
- **Partial Updates:** `events.service.update()` dynamically builds SET clause from provided fields only
- **Fire-and-Forget Logging:** `notifications_log` inserts don't block the response

---

## Weather Icon URL Format

```
https://openweathermap.org/img/wn/{icon_code}@2x.png
```
Example: `icon_code = "01d"` → `https://openweathermap.org/img/wn/01d@2x.png`

---

## Logger Configuration (Winston)

- **Console:** Colorized, dev-friendly
- **`logs/error.log`:** Error level only
- **`logs/combined.log`:** All levels
- **Level:** `debug` in development, `info` in production
- **Format:** Timestamp + level + message + stack traces on errors
