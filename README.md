# Agneto Dashboard Backend

A Node.js/Express REST API backend for the **Team Agneto** dashboard running on a Raspberry Pi 4. It powers an Angular frontend with real-time system monitoring, weather data, team management, event scheduling, and time-based notifications.

---

## Features

- **System Stats** — Live CPU, RAM, disk usage, and CPU temperature from the Raspberry Pi
- **Weather** — Current weather and history via OpenWeatherMap API (auto-fetched every 30 min)
- **Team** — Active team member roster served from MySQL
- **Events** — Full CRUD for events, holidays, and birthdays
- **Notifications** — Time-window based alerts (check-in, check-out, lunch, timesheet) polled by Angular every 30 seconds
- **Background Jobs** — Automated data collection and daily cleanup via cron
- **Structured Logging** — Winston logger with file and console output

---

## Tech Stack

- **Runtime:** Node.js >= 20.0.0
- **Framework:** Express.js 4.21.1
- **Database:** MySQL 8.0+ (mysql2, connection pooling)
- **Date/Time:** Luxon (DST-safe, America/Chicago timezone)
- **Security:** Helmet, CORS, express-validator
- **Jobs:** node-cron
- **Logging:** Winston
- **HTTP Client:** Axios (OpenWeatherMap)

---

## Project Structure

```
dashboard-backend/
├── sql/
│   └── schema.sql               # MySQL database schema
├── src/
│   ├── app.js                   # Express app: middleware & routes
│   ├── server.js                # Server bootstrap
│   ├── config/
│   │   ├── constants.js         # Team name, timezone, notification windows
│   │   ├── database.js          # MySQL connection pool
│   │   └── logger.js            # Winston logger
│   ├── middleware/
│   │   ├── auth.js              # JWT placeholder (ready to implement)
│   │   ├── errorHandler.js      # Global error handler + AppError class
│   │   └── notFound.js          # 404 handler
│   ├── routes/                  # Express routers (one per resource)
│   ├── controllers/             # Request/response handlers
│   ├── services/                # Business logic & database queries
│   ├── validators/              # express-validator rules
│   └── jobs/                    # Cron job definitions
├── .env.example                 # Environment variable template
├── API_DOCS.md                  # Full API reference
└── CLAUDE.md                    # AI assistant context & architecture notes
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- MySQL 8.0+
- OpenWeatherMap API key (free at [openweathermap.org/api](https://openweathermap.org/api))

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

```bash
mysql -u root -p < sql/schema.sql
```

This creates the `team_agneto_db` database, all tables, and a `dashboard_user`. Uncomment the `CREATE USER` lines in `schema.sql` if the user doesn't exist yet.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=dashboard_user
DB_PASSWORD=your_db_password
DB_NAME=team_agneto_db

WEATHER_API_KEY=ffc161391afc291dc09c055a952e8117
WEATHER_CITY=Dallas
WEATHER_COUNTRY=US
WEATHER_UNITS=imperial

CORS_ORIGINS=*
```

### 4. Run the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server starts on `http://0.0.0.0:3000` by default.

---

## API Reference

### Health Check
```
GET /health
```

### Time
```
GET /api/time
```

### Weather
```
GET  /api/weather/current
GET  /api/weather/history?limit=48
POST /api/weather/refresh
```

### System Stats
```
GET /api/system-stats/current
GET /api/system-stats/history?limit=12
```

### Team
```
GET /api/team
```

### Events
```
GET    /api/events?type=event|holiday|birthday&upcoming=true
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
```

### Notifications
```
GET /api/notifications/schedule
GET /api/notifications/active
```

All responses follow the envelope format:
```json
{ "success": true, "data": {} }
{ "success": false, "error": "message" }
```

See [API_DOCS.md](API_DOCS.md) for full request/response details.

---

## Notification Windows (CST)

| Type | Days | Window |
|---|---|---|
| `checkin` | Mon–Fri | 09:01 – 09:05 |
| `checkout` | Mon–Fri | 17:00 – 17:10 |
| `timesheet` | Friday | 16:00 – 16:15 |
| `lunch` | Mon–Fri | 12:00 – 12:15 |

The Angular frontend polls `/api/notifications/active` every 30 seconds and displays a dismissible modal when a window is active.

---

## Background Jobs

| Job | Schedule | Action |
|---|---|---|
| Weather fetch | Every 30 min | Fetches from OpenWeatherMap, stores in DB |
| System stats | Every 5 min | Captures CPU/RAM/Disk/Temp, stores in DB |
| Cleanup | Daily 2:00 AM CST | Purges old records based on retention settings |

---

## Database Tables

| Table | Purpose | Retention |
|---|---|---|
| `weather_data` | Weather snapshots | 7 days |
| `system_stats` | Pi resource snapshots | 3 days |
| `team_members` | Team roster | Manual |
| `events` | Events/holidays/birthdays | Manual |
| `notifications_log` | Notification audit trail | 30 days |
| `api_call_log` | Outbound API call log | 30 days |

---

## Deployment on Raspberry Pi

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and install
git clone https://github.com/sakshi-kherdekar/agneto-dashboard.git
cd agneto-dashboard
npm install

# Set up DB and .env (see Getting Started above)

# Run with PM2
npm install -g pm2
pm2 start src/server.js --name dashboard-backend
pm2 startup && pm2 save
```

---

## Security Notes

- `.env` is git-ignored — never commit real credentials
- All SQL queries use parameterized statements (no SQL injection risk)
- Helmet sets secure HTTP headers
- Input validation via express-validator on all write endpoints
- Authentication is currently open (JWT middleware is stubbed and ready to implement)
