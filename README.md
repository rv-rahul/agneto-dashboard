# Agneto Dashboard

A team dashboard built with Angular 19 for managing team information, events, schedules, and daily reminders.

## Features

- **Weather Card** — Current weather conditions with temperature and forecast
- **Team Members** — View team roster with contact details, birthdays, and planned leave
- **Upcoming Events** — Track team events, holidays, and birthdays in a 3-column layout
- **Daily Reminders** — Notification schedule for check-in, lunch, timesheet, and check-out
- **Notes** — Quick team notes with local storage persistence
- **Create Events** — Add new events, holidays, or birthdays via dialog

## Tech Stack

- **Angular 19** — Standalone components, new control flow syntax (`@for`, `@if`)
- **Angular Material** — UI components (dialogs, icons, buttons, tooltips)
- **TypeScript** — Strict typing with shared models
- **RxJS** — Reactive API calls with fallback data
- **SCSS** — Component-scoped styles

## Project Structure

```
src/app/
├── models/
│   └── models.ts              # Shared interfaces (TeamMember, WeatherData, etc.)
├── services/
│   ├── api.service.ts          # REST API service (HttpClient)
│   └── time.service.ts         # Clock/time observable service
├── components/
│   ├── dashboard/              # Main layout (3-section grid)
│   ├── weather/                # Weather card
│   ├── team-info/              # Team member count card
│   ├── team-members-dialog/    # Team roster dialog with details
│   ├── upcoming-events/        # Events, holidays, birthdays (3-col)
│   ├── notification-schedule/  # Daily reminders card
│   ├── events/                 # Notes textarea
│   ├── clock/                  # Clock display
│   └── create-event-dialog/    # New event form dialog
└── app.config.ts               # App providers (HttpClient, animations)
```

## Setup

```bash
npm install
ng serve
```

Open `http://localhost:4200/` in your browser.

## API Integration

The `ApiService` connects to a backend at `http://localhost:3000/api` with the following endpoints:

| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| GET    | `/api/team-members`  | List team members      |
| GET    | `/api/events`        | Upcoming events        |
| GET    | `/api/holidays`      | Holiday list           |
| GET    | `/api/birthdays`     | Birthday list          |
| POST   | `/api/events`        | Create a new event     |
| GET    | `/api/weather`       | Weather data           |
| GET    | `/api/notifications` | Notification items     |
| GET    | `/api/reminders`     | Reminder items         |

All endpoints include fallback to hardcoded sample data when the API is unavailable.

## Build

```bash
ng build
```

Build artifacts are output to the `dist/` directory.
