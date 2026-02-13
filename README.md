# Agneto Dashboard

A full-stack team dashboard with an Angular 19 frontend and Node.js/Express backend, designed to run on a Raspberry Pi 4.

## Features

### Frontend (Angular 19)
- **Weather Card** — Current weather conditions with temperature and forecast
- **Team Members** — View team roster with contact details, birthdays, and planned leave
- **Upcoming Events** — Track team events, holidays, and birthdays in a 3-column layout
- **Daily Reminders** — Notification schedule for check-in, lunch, timesheet, and check-out
- **Notes** — Quick team notes with local storage persistence
- **Create Events** — Add new events, holidays, or birthdays via dialog

### Backend (Node.js/Express)
- **System Stats** — Live CPU, RAM, disk usage, and CPU temperature from the Raspberry Pi
- **Weather** — Current weather and history via OpenWeatherMap API (auto-fetched every 30 min)
- **Team** — Active team member roster served from MySQL
- **Events** — Full CRUD for events, holidays, and birthdays
- **Notifications** — Time-window based alerts polled by Angular every 30 seconds
- **Background Jobs** — Automated data collection and daily cleanup via cron

## Tech Stack

- **Frontend:** Angular 19, Angular Material, TypeScript, RxJS, SCSS
- **Backend:** Node.js >= 20, Express 4, MySQL 8, Luxon, Helmet, Winston
- **Deployment:** Raspberry Pi 4 with PM2

## Project Structure

```
agneto-dashboard/
├── src/app/                        # Angular frontend
│   ├── models/models.ts            # Shared interfaces (TeamMember, WeatherData, etc.)
│   ├── services/
│   │   ├── api.service.ts          # REST API service (HttpClient)
│   │   └── time.service.ts         # Clock/time observable service
│   ├── components/
│   │   ├── dashboard/              # Main layout (3-section grid)
│   │   ├── weather/                # Weather card
│   │   ├── team-info/              # Team member count card
│   │   ├── team-members-dialog/    # Team roster dialog with details
│   │   ├── upcoming-events/        # Events, holidays, birthdays (3-col)
│   │   ├── notification-schedule/  # Daily reminders card
│   │   ├── events/                 # Notes textarea
│   │   ├── clock/                  # Clock display
│   │   └── create-event-dialog/    # New event form dialog
│   └── app.config.ts               # App providers (HttpClient, animations)
├── sql/schema.sql                  # MySQL database schema
├── src/ (backend)
│   ├── app.js                      # Express app: middleware & routes
│   ├── server.js                   # Server bootstrap
│   ├── config/                     # DB, logger, constants
│   ├── routes/                     # Express routers
│   ├── controllers/                # Request/response handlers
│   ├── services/                   # Business logic & DB queries
│   └── jobs/                       # Cron job definitions
└── package.json                    # Angular frontend dependencies
```

## Setup

### Frontend

```bash
npm install
ng serve
```

Open `http://localhost:4200/` in your browser.

### Backend

```bash
cd dashboard-backend   # if in separate directory
npm install
cp .env.example .env   # configure DB, weather API key
mysql -u root -p < sql/schema.sql
npm run dev
```

Server starts on `http://localhost:3000`.

## API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/health`                 | Health check             |
| GET    | `/api/time`               | Server time              |
| GET    | `/api/weather/current`    | Current weather          |
| GET    | `/api/system-stats/current` | Pi system stats        |
| GET    | `/api/team`               | Team members             |
| GET    | `/api/events`             | Events (filter by type)  |
| POST   | `/api/events`             | Create event             |
| PUT    | `/api/events/:id`         | Update event             |
| DELETE | `/api/events/:id`         | Delete event             |
| GET    | `/api/notifications/active` | Active notifications   |

All responses follow: `{ "success": true, "data": {} }`

## Build

```bash
ng build
```

Build artifacts are output to the `dist/` directory.
