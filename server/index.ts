import { Database } from "bun:sqlite";
import { deviceRoutes } from "./routes/devices";
import { scheduleRoutes } from "./routes/schedules";
import { Scheduler } from "./services/scheduler";
import { initDatabase } from "./db/database";

const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = process.env.DB_PATH || "./data/oppressor.db";

// Initialize SQLite (Bun native driver — no dependencies)
const db = new Database(DB_PATH, { create: true });
initDatabase(db);

// Start the cron scheduler for block/unblock jobs
const scheduler = new Scheduler(db);
scheduler.start();

// Bun HTTP server — no Express/Fastify needed
const server = Bun.serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS for Quasar dev server
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // API routing
    if (path.startsWith("/api/devices")) {
      return deviceRoutes(req, db);
    }
    if (path.startsWith("/api/schedules")) {
      return scheduleRoutes(req, db);
    }

    // Health check
    if (path === "/api/health") {
      return Response.json(
        { status: "ok", uptime: process.uptime() },
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
});

console.log(`Oppressor server running on http://localhost:${server.port}`);
