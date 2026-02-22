# Agneto Dashboard

A full-stack team dashboard with an Angular 19 frontend and Node.js/Express backend, designed to run on a Raspberry Pi 4.

## Features

### Frontend (Angular 19)
- **Weather Card** — Current weather conditions with temperature and forecast
- **Team Members** — View team roster with contact details, birthdays, and planned leave
- **Upcoming Events** — Track team events, holidays, and birthdays in a 3-column layout
- **Seating Arrangement** — Persistent dev table seating with animated shuffle (password-protected)
- **Daily Reminders** — Notification schedule for check-in, lunch, timesheet, and check-out
- **Create Events** — Add new events, holidays, or birthdays via dialog
- **Theme Switcher** — 6 switchable color themes

### Backend (Node.js/Express)
- **System Stats** — Live CPU, RAM, disk usage, and CPU temperature from the Raspberry Pi
- **Weather** — Current weather and history via OpenWeatherMap API (auto-fetched every 30 min)
- **Team** — Active team member roster served from MySQL
- **Events** — Full CRUD for events, holidays, and birthdays
- **Seating** — Persisted shuffle seed with password-protected updates
- **Notifications** — Time-window based alerts polled by Angular every 30 seconds
- **Background Jobs** — Automated data collection and daily cleanup via cron

## Tech Stack

- **Frontend:** Angular 19, Angular Material, TypeScript, RxJS, SCSS
- **Backend:** Node.js >= 20, Express 4, MySQL 8, Luxon, Helmet, Winston
- **Deployment:** Raspberry Pi 4 with PM2

## Project Structure

```
agneto-dashboard/
├── backend/                        # Express REST API
│   ├── src/
│   │   ├── server.js               # Server bootstrap
│   │   ├── app.js                  # Express app: middleware & routes
│   │   ├── config/                 # DB pool, logger, constants, swagger
│   │   ├── controllers/            # Request/response handlers
│   │   ├── routes/                 # Express routers
│   │   ├── services/               # Business logic & DB queries
│   │   ├── middleware/             # Auth, error handler, 404
│   │   ├── validators/             # express-validator rules
│   │   └── jobs/                   # Cron jobs (weather, stats, cleanup)
│   ├── sql/
│   │   ├── schema.sql              # MySQL 8 database schema
│   │   └── seating_seed.sql        # Seating config migration
│   ├── logs/                       # Runtime logs (error.log, combined.log)
│   ├── .env                        # Local environment config (not committed)
│   ├── .env.example                # Environment variable template
│   └── package.json                # Backend dependencies only
│
├── frontend/                       # Angular 19 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── models/models.ts    # Shared interfaces (TeamMember, WeatherData, etc.)
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts          # REST API calls (HttpClient)
│   │   │   │   ├── notification.service.ts # Polls backend for active alerts
│   │   │   │   ├── sound.service.ts        # Notification sounds
│   │   │   │   └── time.service.ts         # Clock observable
│   │   │   ├── components/
│   │   │   │   ├── dashboard/              # Main layout container
│   │   │   │   ├── weather/                # Weather card
│   │   │   │   ├── clock/                  # Live clock display
│   │   │   │   ├── team-info/              # Team member count
│   │   │   │   ├── team-members-dialog/    # Full roster dialog
│   │   │   │   ├── upcoming-events/        # Events, holidays, birthdays
│   │   │   │   ├── notification-schedule/  # Daily reminders card
│   │   │   │   ├── seating-arrangement/     # Dev table seating layout
│   │   │   │   ├── events/                 # Events list
│   │   │   │   ├── create-event-dialog/    # New event form dialog
│   │   │   │   └── reminder-dialog/        # Active notification modal
│   │   │   └── app.config.ts               # App providers
│   │   ├── main.ts
│   │   ├── styles.scss
│   │   └── index.html
│   ├── angular.json
│   ├── tsconfig.json
│   └── package.json                # Frontend dependencies only
│
└── package.json                    # Workspace convenience scripts
```

## Setup

### Prerequisites

- Node.js >= 20
- MySQL 8.0+
- OpenWeatherMap API key (free at [openweathermap.org/api](https://openweathermap.org/api))

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd agneto-dashboard
npm run install:all
```

Or install separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Set up the database

```bash
# Create DB and user in MySQL
mysql -u root -p
```

```sql
CREATE DATABASE team_agneto_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'dashboard_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON team_agneto_db.* TO 'dashboard_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
mysql -u dashboard_user -p team_agneto_db < backend/sql/schema.sql
mysql -u dashboard_user -p team_agneto_db < backend/sql/seating_seed.sql
```

### 3. Configure the backend environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DB_PASSWORD=your_password
WEATHER_API_KEY=your_openweathermap_key
WEATHER_CITY=Dallas
WEATHER_COUNTRY=US
SHUFFLE_PASSWORD=your_shuffle_password
```

### 4. Start both with one command (recommended)

From the workspace root:

```bash
npm run dev
```

This starts both backend and frontend concurrently with colour-coded output:
- `[backend]` → http://localhost:3000
- `[frontend]` → http://localhost:4200
- Swagger docs → http://localhost:3000/api-docs

Press `Ctrl+C` to stop both at once.

### Or start separately

```bash
# Terminal 1 — backend (nodemon, auto-reload)
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm start
```

### Available root scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both backend + frontend (development) |
| `npm start` | Start both backend + frontend (production) |
| `npm run dev:backend` | Backend only (nodemon) |
| `npm run dev:frontend` | Frontend only |
| `npm run install:all` | Install deps in both backend/ and frontend/ |

## API Endpoints

All responses follow: `{ "success": true, "data": {} }`

| Method | Endpoint                      | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | `/health`                     | Health check                       |
| GET    | `/api/time`                   | Server time (CST + UTC)            |
| GET    | `/api/weather/current`        | Latest weather snapshot            |
| POST   | `/api/weather/refresh`        | Force weather refresh from OWM     |
| GET    | `/api/system-stats/current`   | Live Pi CPU / RAM / disk / temp    |
| GET    | `/api/team`                   | Team name, count, and roster       |
| GET    | `/api/events`                 | Events (filter: `?type=` `?upcoming=true`) |
| POST   | `/api/events`                 | Create event                       |
| PUT    | `/api/events/:id`             | Update event (partial)             |
| DELETE | `/api/events/:id`             | Delete event                       |
| GET    | `/api/seating`                | Get current seating seed           |
| PUT    | `/api/seating`                | Update seed (requires password)    |
| GET    | `/api/notifications/active`   | Currently active time-window alerts|
| GET    | `/api-docs`                   | Swagger UI API documentation       |

## Notification Windows (CST)

| Type       | Days        | Window          |
|------------|-------------|-----------------|
| Check-In   | Mon–Fri     | 09:01 – 09:05   |
| Lunch      | Mon–Fri     | 12:00 – 12:15   |
| Check-Out  | Mon–Fri     | 17:00 – 17:10   |
| Timesheet  | Friday only | 16:00 – 16:15   |

## Build

```bash
cd frontend
npm run build
```

Output goes to `frontend/dist/`.

## Deployment on Raspberry Pi

See [DEPLOYMENT.md](DEPLOYMENT.md) for full Pi setup with PM2.
