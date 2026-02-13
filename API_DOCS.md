# Team Agneto Dashboard — API Reference

**Base URL:** `http://<pi-ip-address>:3000`
**Port:** `3000` (configurable via `PORT` in `.env`)
**CORS:** Open (`*`) by default — lock down to Angular origin in production via `CORS_ORIGINS` env var.

All API responses follow this envelope:
```json
{ "success": true, "data": <payload> }
{ "success": false, "error": "<message>" }
```

---

## Health Check

### `GET /health`
Server liveness check. No auth required.

**Response:**
```json
{
  "status": "ok",
  "team": "Team Agneto",
  "timestamp": "2025-01-15T15:02:00.000Z"
}
```

---

## Time

### `GET /api/time`
Returns current server time in CST (Central Standard/Daylight Time).
Angular frontend uses this to display the real-time clock and drive notification logic.

**Response `data`:**
```json
{
  "iso_cst":     "2025-01-15T09:02:00.000-06:00",
  "iso_utc":     "2025-01-15T15:02:00.000Z",
  "epoch_ms":    1736949720000,
  "date_cst":    "2025-01-15",
  "time_cst":    "09:02:00",
  "display_cst": "Wednesday, January 15, 2025  9:02:00 AM CST",
  "day_of_week": "Wednesday",
  "is_weekday":  true,
  "timezone":    "America/Chicago",
  "utc_offset":  "-0600"
}
```

---

## Weather

### `GET /api/weather/current`
Returns the most recent weather snapshot stored in the database.
Weather is fetched automatically every 30 minutes from OpenWeatherMap.

**Response `data`:**
```json
{
  "id":            42,
  "city":          "Dallas",
  "country":       "US",
  "temp_f":        72.50,
  "feels_like_f":  70.10,
  "temp_min_f":    68.00,
  "temp_max_f":    75.00,
  "humidity":      45,
  "pressure":      1013,
  "description":   "clear sky",
  "icon_code":     "01d",
  "wind_speed_mph": 8.50,
  "wind_deg":      180,
  "visibility_mi": 10.00,
  "sunrise_utc":   1736860800,
  "sunset_utc":    1736902200,
  "fetched_at":    "2025-01-15T15:00:00.000Z"
}
```

**Icon URL:** `https://openweathermap.org/img/wn/{icon_code}@2x.png`
e.g. `https://openweathermap.org/img/wn/01d@2x.png`

---

### `GET /api/weather/history?limit=48`
Returns the last N weather snapshots (newest first).

| Query Param | Type | Default | Max | Description |
|---|---|---|---|---|
| `limit` | integer | 48 | 200 | Number of records to return |

**Response:**
```json
{
  "success": true,
  "count": 48,
  "data": [ ...array of weather_data rows... ]
}
```

---

### `POST /api/weather/refresh`
Manually triggers a fresh fetch from OpenWeatherMap and stores the result.
Useful for testing or forcing an immediate update.

**Request body:** none
**Response:** Returns the newly fetched weather data.

---

## System Stats

### `GET /api/system-stats/current`
Captures live system resource usage from the Raspberry Pi and stores a snapshot in the database.

**Response `data`:**
```json
{
  "cpu_percent":  12.45,
  "ram_percent":  45.12,
  "disk_percent": 23.00,
  "cpu_temp_c":   42.50,
  "ram_used_mb":  1842,
  "ram_total_mb": 4096,
  "disk_used_gb": 8.23,
  "disk_total_gb": 32.00
}
```

> **Note:** `cpu_temp_c` is `null` when not running on a Raspberry Pi (dev environment).

---

### `GET /api/system-stats/history?limit=12`
Returns the last N system stat snapshots (newest first).

| Query Param | Type | Default | Max | Description |
|---|---|---|---|---|
| `limit` | integer | 12 | 288 | Number of records to return |

---

## Team

### `GET /api/team`
Returns team name, active member count, and full active member roster.

**Response `data`:**
```json
{
  "team_name":    "Team Agneto",
  "member_count": 6,
  "members": [
    {
      "id":          1,
      "full_name":   "Jane Smith",
      "email":       "jane@example.com",
      "role":        "Backend Developer",
      "birthday":    "1990-05-20",
      "joined_date": "2022-01-10"
    }
  ]
}
```

> **To add team members:** Insert rows directly into the `team_members` table in MySQL.
> A future admin endpoint can be added behind JWT auth.

---

## Events (Full CRUD)

Events support three types: `event`, `holiday`, `birthday`.

### `GET /api/events`
List all events, optionally filtered.

| Query Param | Values | Description |
|---|---|---|
| `type` | `event` \| `holiday` \| `birthday` | Filter by type |
| `upcoming` | `true` | Only future events (event_date >= today) |

**Examples:**
- `GET /api/events` — all events
- `GET /api/events?upcoming=true` — upcoming events only
- `GET /api/events?type=holiday&upcoming=true` — upcoming holidays

---

### `GET /api/events/:id`
Returns a single event by ID.

---

### `POST /api/events`
Creates a new event.

**Request body:**
```json
{
  "title":        "Team Holiday Party",
  "event_type":   "event",
  "event_date":   "2025-12-20",
  "end_date":     null,
  "description":  "Annual team celebration",
  "all_day":      true,
  "start_time":   null,
  "end_time":     null,
  "is_recurring": false,
  "recur_rule":   null
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Max 255 chars |
| `event_type` | string | No | `event` (default) \| `holiday` \| `birthday` |
| `event_date` | string | Yes | ISO date: `YYYY-MM-DD` |
| `end_date` | string | No | For multi-day events |
| `description` | string | No | Free-form text, max 2000 chars |
| `all_day` | boolean | No | Default `true` |
| `start_time` | string | No | `HH:MM` — only when `all_day: false` |
| `end_time` | string | No | `HH:MM` — only when `all_day: false` |
| `is_recurring` | boolean | No | Default `false` |
| `recur_rule` | string | No | e.g. `"Annually"`, max 100 chars |

**Response:** `201 Created` with the created event.

---

### `PUT /api/events/:id`
Updates an existing event. Partial updates supported — only include fields you want to change.

**Request body:** Same fields as POST (all optional for PUT).

---

### `DELETE /api/events/:id`
Deletes an event.

**Response:**
```json
{ "success": true, "data": { "deleted": true, "id": 5 } }
```

---

## Notifications

The notification system is time-based. Angular polls `/api/notifications/active` every 30 seconds and shows dismissible modal alerts for any active notifications.

### Notification Windows (CST)

| Type | Label | Days | Window |
|---|---|---|---|
| `checkin` | Daily Check-In Reminder | Mon–Fri | 09:01–09:05 |
| `checkout` | Daily Check-Out Reminder | Mon–Fri | 17:00–17:10 |
| `timesheet` | Submit Your Timesheet | Friday only | 16:00–16:15 |
| `lunch` | Lunch Break | Mon–Fri | 12:00–12:15 |

---

### `GET /api/notifications/schedule`
Returns the full static notification schedule. Use this to build a settings/info view in Angular.

**Response `data`:**
```json
[
  {
    "type":   "checkin",
    "label":  "Daily Check-In Reminder",
    "days":   ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "window": "09:01 – 09:05 CST"
  },
  {
    "type":   "checkout",
    "label":  "Daily Check-Out Reminder",
    "days":   ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "window": "17:00 – 17:10 CST"
  },
  {
    "type":   "timesheet",
    "label":  "Submit Your Timesheet",
    "days":   ["Friday"],
    "window": "16:00 – 16:15 CST"
  },
  {
    "type":   "lunch",
    "label":  "Lunch Break",
    "days":   ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "window": "12:00 – 12:15 CST"
  }
]
```

---

### `GET /api/notifications/active`
Returns which notifications are currently active based on CST server time.
**Angular should poll this every 30 seconds.**

**Response `data`:**
```json
{
  "server_time_cst":      "2025-01-15T09:03:00.000-06:00",
  "day_of_week":          "Wednesday",
  "active_notifications": [
    { "type": "checkin", "label": "Daily Check-In Reminder" }
  ]
}
```

When `active_notifications` is an empty array `[]`, no notification should be shown.

**Angular integration example:**
```typescript
// Poll every 30 seconds
interval(30000).pipe(
  startWith(0),
  switchMap(() => this.http.get<ApiResponse>('/api/notifications/active'))
).subscribe(response => {
  response.data.active_notifications.forEach(notification => {
    this.showModal(notification.label); // Your modal service
  });
});
```

---

## Error Responses

| Status | Meaning |
|---|---|
| `400` | Bad request — validation failed or missing required field |
| `404` | Resource not found |
| `422` | Unprocessable entity — field-level validation errors |
| `500` | Internal server error |

**Validation error (422) response:**
```json
{
  "success": false,
  "errors": [
    { "field": "event_date", "msg": "event_date must be a valid date (YYYY-MM-DD)" },
    { "field": "title", "msg": "title is required" }
  ]
}
```

---

## Deployment on Raspberry Pi

```bash
# 1. Install Node.js 20 LTS on Pi
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Copy project to Pi (from dev machine)
scp -r dashboard-backend/ pi@<pi-ip>:/home/pi/

# 3. Install dependencies
cd /home/pi/dashboard-backend
npm install --production

# 4. Set up MySQL schema
mysql -u root -p < sql/schema.sql

# 5. Configure environment
cp .env.example .env
nano .env  # set DB_PASSWORD, WEATHER_API_KEY, NODE_ENV=production

# 6. Create logs directory
mkdir logs

# 7. Install PM2 for process management
sudo npm install -g pm2
pm2 start src/server.js --name dashboard-backend
pm2 startup    # auto-start on Pi reboot
pm2 save

# 8. Verify
curl http://localhost:3000/health
```

**Find Pi's IP:** `hostname -I`
**View logs:** `pm2 logs dashboard-backend`
**Restart:** `pm2 restart dashboard-backend`
