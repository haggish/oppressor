# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install                # Install dependencies

bun run dev                # Start both frontend (port 9000) and backend (port 3000) concurrently
bun run dev:frontend       # Quasar/Vite dev server only
bun run dev:backend        # Bun backend with --watch only

bun run build              # Build Quasar frontend to dist/
bun run build:backend      # Bundle server to dist/server/index.js (target: bun)
bun run start              # Run production build

bun test                   # Run all tests
bun test <file>            # Run a single test file

bun run seed               # Seed the SQLite DB with test devices
```

The frontend dev server uses `VITE_API_URL=http://localhost:3000` to proxy API calls. The backend reads `.env` for credentials — copy `.env.example` to `.env` before first run.

## Architecture

Oppressor is a parental-control dashboard that manages internet access per device by sending SOAP commands to a Fritz!Box router.

### Data flow

1. **Device discovery**: `server/services/fritzbox.ts` wraps the Fritz!Box TR-064 SOAP API (port 49443, self-signed TLS). `getHosts()` iterates by index to enumerate known network devices. Block/unblock call `X_AVM-DE_HostFilter` service actions.

2. **Persistence**: `server/db/database.ts` holds three SQLite tables — `devices` (managed devices), `schedules` (block windows per device), `block_log` (audit trail). The DB file path is `DB_PATH` env var, defaulting to `./data/oppressor.db`.

3. **Scheduler**: `server/services/scheduler.ts` runs a `setInterval` at 60-second granularity. Each tick queries enabled schedules, checks whether `HH:MM` falls inside the block window (supports overnight windows like 23:00→06:00), and calls block/unblock accordingly.

4. **HTTP routing**: `server/index.ts` uses `Bun.serve()` directly — no framework. Path prefix matching dispatches to `deviceRoutes` or `scheduleRoutes`. CORS headers are returned for `OPTIONS` preflight.

5. **Frontend**: Quasar v2 (Vue 3 + Vite). State lives in a Pinia store (`src/stores/deviceStore.ts`). Composables in `src/composables/` handle API calls. Shared TypeScript types for `Device`, `Schedule`, `DayOfWeek`, etc. are in `src/types/index.ts` — both frontend and backend import from there.

### Key constraints

- The backend uses `tls: { rejectUnauthorized: false }` because Fritz!Box uses a self-signed certificate — do not remove this.
- `DayOfWeek` strings (`"mon"` … `"sun"`) are stored as a JSON array in the `schedules.days` column.
- The Scheduler shares the `DayOfWeek` type imported from `src/types/index.ts`, keeping frontend and backend in sync.
