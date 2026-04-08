# Oppressor

Parental control dashboard for Fritz!Box routers. Schedule internet access
per device using friendly names and time windows.

## Stack

- **Runtime**: Bun (backend + package manager + test runner)
- **Frontend**: Quasar v2 (Vue 3 + Vite), builds to web, iOS, Android
- **Backend**: Bun.serve() — zero-dependency HTTP server
- **Database**: SQLite via Bun's native `bun:sqlite` driver
- **Router API**: Fritz!Box TR-064 (SOAP over HTTPS)

## Prerequisites

- [Bun](https://bun.sh) v1.1+
- Fritz!Box with TR-064 enabled (Fritz!Box admin → Home Network → Network → Network Settings)
- A Fritz!Box user account with "Smart Home" or "NAS" permissions

## Setup

```bash
# Clone and install
git clone <repo-url> && cd oppressor
bun install

# Configure Fritz!Box credentials
cp .env.example .env
# Edit .env with your Fritz!Box IP, username, and password

# Start development (frontend + backend)
bun run dev
```

Frontend opens at `http://localhost:9000`, backend API at `http://localhost:3000`.

## Deploy to Raspberry Pi

```bash
# On the Pi (64-bit OS required for Bun)
curl -fsSL https://bun.sh/install | bash

# Build for production
bun run build
bun run build:backend

# Run
cp .env.example .env  # configure credentials
bun run start
```

For auto-start on boot, create a systemd service:

```ini
# /etc/systemd/system/oppressor.service
[Unit]
Description=Oppressor Parental Control
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/oppressor
ExecStart=/home/pi/.bun/bin/bun dist/server/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

## Mobile build (via Capacitor)

```bash
# Add mobile platforms
quasar mode add capacitor
cd src-capacitor
bun install @capacitor/core @capacitor/cli

# Build and open in Xcode / Android Studio
quasar build -m capacitor -T ios
quasar build -m capacitor -T android
```

## API

| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | /api/devices                  | List managed devices     |
| GET    | /api/devices/discover         | Scan Fritz!Box hosts     |
| POST   | /api/devices                  | Add device to manage     |
| POST   | /api/devices/:id/block        | Block immediately        |
| POST   | /api/devices/:id/unblock      | Unblock immediately      |
| GET    | /api/schedules                | List all schedules       |
| POST   | /api/schedules                | Create schedule          |
| PUT    | /api/schedules/:id/toggle     | Enable/disable schedule  |
| DELETE | /api/schedules/:id            | Remove schedule          |
| GET    | /api/health                   | Server health check      |
