# Raspberry Pi Deployment Guide
**Team Agneto Dashboard Backend — Infrastructure Setup**

This document covers everything the infrastructure team needs to deploy and run the dashboard backend on a Raspberry Pi 4.

---

## Hardware Requirements

| Component | Minimum | Recommended |
|---|---|---|
| Model | Raspberry Pi 4 | Raspberry Pi 4 |
| RAM | 2 GB | 4 GB |
| Storage | 16 GB microSD | 32 GB microSD (Class 10 / A2) |
| OS | Raspberry Pi OS Lite 64-bit | Raspberry Pi OS Lite 64-bit (Bookworm) |
| Network | Ethernet or Wi-Fi | **Ethernet** (more reliable for a server) |

---

## Step 1 — Prepare Raspberry Pi OS

### Flash the OS
1. Download **Raspberry Pi Imager**: https://www.raspberrypi.com/software/
2. Select **Raspberry Pi OS Lite (64-bit)** — no desktop needed
3. In the imager settings (gear icon), configure:
   - Hostname: `agneto-dashboard`
   - Enable SSH (password or key-based)
   - Set username/password
   - Configure Wi-Fi if not using Ethernet
4. Flash to microSD and boot the Pi

### SSH into the Pi
```bash
ssh pi@agneto-dashboard.local
# or use the Pi's IP address:
ssh pi@192.168.x.x
```

### Update the system
```bash
sudo apt update && sudo apt upgrade -y
```

---

## Step 2 — Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify:
```bash
node --version   # should print v20.x.x
npm --version
```

---

## Step 3 — Install MySQL

> **Note:** Both MySQL 8.0 and MariaDB 10.6+ are compatible. MariaDB is recommended on Pi as it installs directly from apt without extra repos.

### Option A — MariaDB (recommended for Pi)
```bash
sudo apt install -y mariadb-server
sudo systemctl enable mariadb
sudo systemctl start mariadb
sudo mysql_secure_installation
```

During `mysql_secure_installation`:
- Set root password: choose a strong password, note it down
- Remove anonymous users: **Yes**
- Disallow root login remotely: **Yes**
- Remove test database: **Yes**
- Reload privilege tables: **Yes**

### Option B — MySQL 8.0
```bash
sudo apt install -y gnupg
wget https://dev.mysql.com/get/mysql-apt-config_0.8.29-1_all.deb
sudo dpkg -i mysql-apt-config_0.8.29-1_all.deb
sudo apt update
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql
sudo mysql_secure_installation
```

---

## Step 4 — Set Up the Database

Log in as root:
```bash
sudo mysql -u root -p
```

Run the following SQL (replace `<DB_PASSWORD>` with a strong password):
```sql
CREATE DATABASE IF NOT EXISTS team_agneto_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'dashboard_user'@'localhost'
  IDENTIFIED BY '<DB_PASSWORD>';

GRANT ALL PRIVILEGES ON team_agneto_db.* TO 'dashboard_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Then import the schema:
```bash
mysql -u dashboard_user -p team_agneto_db < /path/to/project/sql/schema.sql
```

Verify tables were created:
```bash
mysql -u dashboard_user -p team_agneto_db -e "SHOW TABLES;"
```

Expected output:
```
+---------------------------+
| Tables_in_team_agneto_db  |
+---------------------------+
| api_call_log              |
| events                    |
| notifications_log         |
| system_stats              |
| team_members              |
| weather_data              |
+---------------------------+
```

---

## Step 5 — Deploy the Application

### Clone the repository
```bash
cd /home/pi
git clone https://github.com/sakshi-kherdekar/agneto-dashboard.git dashboard-backend
cd dashboard-backend
```

### Install dependencies
```bash
npm install --omit=dev
```

### Create the environment file
```bash
cp .env.example .env
nano .env
```

Fill in the values:
```env
NODE_ENV=production
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=dashboard_user
DB_PASSWORD=<DB_PASSWORD>
DB_NAME=team_agneto_db
DB_POOL_LIMIT=10

WEATHER_API_KEY=<OPENWEATHERMAP_API_KEY>
WEATHER_CITY=Dallas
WEATHER_COUNTRY=US
WEATHER_UNITS=imperial

WEATHER_RETAIN_DAYS=7
SYSTEM_STATS_RETAIN_DAYS=3
API_LOG_RETAIN_DAYS=30

# Replace with the Angular frontend's IP/hostname
CORS_ORIGINS=http://192.168.x.x:4200,http://agneto-dashboard.local
```

> **Get a free OpenWeatherMap API key at:** https://openweathermap.org/api
> Free tier allows 1,000 calls/day — the app uses ~48/day (every 30 min).

---

## Step 6 — Run with PM2 (Process Manager)

PM2 keeps the app running, restarts it on crash, and survives reboots.

### Install PM2
```bash
sudo npm install -g pm2
```

### Start the app
```bash
cd /home/pi/dashboard-backend
pm2 start src/server.js --name dashboard-backend
```

### Configure auto-start on reboot
```bash
pm2 startup
# PM2 will print a command — copy and run it (it will look like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u pi --hp /home/pi

pm2 save
```

### Useful PM2 commands
```bash
pm2 status                        # check running processes
pm2 logs dashboard-backend        # view live logs
pm2 logs dashboard-backend --err  # errors only
pm2 restart dashboard-backend     # restart the app
pm2 stop dashboard-backend        # stop the app
pm2 delete dashboard-backend      # remove from PM2
```

---

## Step 7 — Configure Firewall (Optional but Recommended)

```bash
sudo apt install -y ufw

# Allow SSH (important — do this first to avoid locking yourself out)
sudo ufw allow ssh

# Allow the API port
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

If using Nginx as a reverse proxy on port 80 instead:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## Step 8 — (Optional) Nginx Reverse Proxy

This allows the API to be accessible on port 80 instead of 3000.

```bash
sudo apt install -y nginx
```

Create a site config:
```bash
sudo nano /etc/nginx/sites-available/dashboard-backend
```

Paste:
```nginx
server {
    listen 80;
    server_name agneto-dashboard.local;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/dashboard-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## Step 9 — Verify the Deployment

```bash
# Health check
curl http://localhost:3000/health

# Current time
curl http://localhost:3000/api/time

# System stats (should show Pi CPU/RAM/Disk/Temp)
curl http://localhost:3000/api/system-stats/current

# Swagger docs (open in browser)
http://agneto-dashboard.local:3000/api-docs
```

Expected health response:
```json
{
  "status": "ok",
  "team": "Team Agneto",
  "timestamp": "2026-02-13T14:00:00.000Z"
}
```

---

## Step 10 — Add Team Members

Team members are managed directly in the database. Connect and insert:

```bash
mysql -u dashboard_user -p team_agneto_db
```

```sql
INSERT INTO team_members (full_name, email, role, birthday, joined_date, is_active)
VALUES
  ('Jane Doe',  'jane@example.com',  'Developer',    '1990-05-15', '2023-01-10', 1),
  ('John Smith','john@example.com',  'Designer',     '1988-11-22', '2023-03-01', 1),
  ('Alice Ray', 'alice@example.com', 'Product Owner','1992-07-04', '2022-09-15', 1);
```

---

## Updating the Application

```bash
cd /home/pi/dashboard-backend
git pull origin main
npm install --omit=dev
pm2 restart dashboard-backend
```

---

## Log File Locations

| Log | Path |
|---|---|
| App logs (all) | `/home/pi/dashboard-backend/logs/combined.log` |
| App errors only | `/home/pi/dashboard-backend/logs/error.log` |
| PM2 logs | `~/.pm2/logs/dashboard-backend-out.log` |
| PM2 error logs | `~/.pm2/logs/dashboard-backend-error.log` |

---

## Environment Variable Reference

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `production` on Pi |
| `PORT` | No | Default: `3000` |
| `DB_HOST` | Yes | `localhost` |
| `DB_PORT` | No | Default: `3306` |
| `DB_USER` | Yes | `dashboard_user` |
| `DB_PASSWORD` | Yes | Set during DB setup |
| `DB_NAME` | Yes | `team_agneto_db` |
| `DB_POOL_LIMIT` | No | Default: `10` |
| `WEATHER_API_KEY` | Yes | OpenWeatherMap API key |
| `WEATHER_CITY` | No | Default: `Dallas` |
| `WEATHER_COUNTRY` | No | Default: `US` |
| `WEATHER_UNITS` | No | `imperial` (°F) or `metric` (°C) |
| `WEATHER_RETAIN_DAYS` | No | Default: `7` |
| `SYSTEM_STATS_RETAIN_DAYS` | No | Default: `3` |
| `API_LOG_RETAIN_DAYS` | No | Default: `30` |
| `CORS_ORIGINS` | Yes | Angular frontend origin(s), comma-separated |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `ECONNREFUSED` on DB | Check `sudo systemctl status mariadb` and verify `.env` password |
| `EADDRINUSE: port 3000` | Another process on port 3000: `sudo lsof -i :3000` then kill the PID |
| CPU temp shows `null` | Normal on non-Pi; on Pi check: `cat /sys/class/thermal/thermal_zone0/temp` |
| Weather always empty | Check `WEATHER_API_KEY` in `.env` and run `POST /api/weather/refresh` |
| PM2 not starting on boot | Re-run `pm2 startup` and `pm2 save` |
| Permission denied on logs | `mkdir -p logs && chmod 755 logs` |
