# Oppressor — Project Structure

## Overview
Parental control dashboard for Fritz!Box routers.
Runtime: Bun | Frontend: Quasar (Vue 3 + Vite) | Backend: Bun HTTP server

```
oppressor/
├── package.json
├── bunfig.toml
├── quasar.config.ts
├── tsconfig.json
├── .env.example
│
├── src/                          # Quasar frontend
│   ├── App.vue
│   ├── router/
│   │   └── routes.ts
│   ├── layouts/
│   │   └── MainLayout.vue
│   ├── pages/
│   │   ├── DashboardPage.vue     # Device overview + status
│   │   ├── DeviceDetailPage.vue  # Per-device schedule editor
│   │   └── SettingsPage.vue      # Fritz!Box connection config
│   ├── components/
│   │   ├── DeviceCard.vue        # Single device w/ status + timeline
│   │   ├── TimelineBar.vue       # 24h visual block/allow bar
│   │   ├── ScheduleEditor.vue    # Time range + day picker
│   │   ├── DeviceScanner.vue     # Discover devices from Fritz!Box
│   │   └── StatusBadge.vue       # Online / Blocked / Offline pill
│   ├── composables/
│   │   ├── useDevices.ts         # Device state + API calls
│   │   ├── useSchedules.ts       # Schedule CRUD
│   │   └── useFritzStatus.ts     # Fritz!Box connection health
│   ├── stores/
│   │   └── deviceStore.ts        # Pinia store for device state
│   ├── types/
│   │   └── index.ts              # Shared TypeScript interfaces
│   └── css/
│       └── app.scss
│
├── server/                       # Bun backend
│   ├── index.ts                  # Entry point — Bun.serve()
│   ├── routes/
│   │   ├── devices.ts            # GET/POST /api/devices
│   │   └── schedules.ts          # GET/POST/DELETE /api/schedules
│   ├── services/
│   │   ├── fritzbox.ts           # TR-064 SOAP client wrapper
│   │   ├── scheduler.ts          # Cron logic for block/unblock
│   │   └── deviceDiscovery.ts    # Polls Fritz!Box for connected hosts
│   ├── db/
│   │   ├── schema.sql            # SQLite table definitions
│   │   └── database.ts           # Bun:sqlite wrapper
│   └── utils/
│       ├── soap.ts               # Generic SOAP/XML helpers
│       └── logger.ts             # Simple structured logger
│
└── scripts/
    ├── dev.ts                    # Starts both frontend + backend
    └── seed.ts                   # Seed DB with test devices
```
