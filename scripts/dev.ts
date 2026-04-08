/**
 * Dev script — starts both the Bun backend and Quasar frontend.
 * Run with: bun run dev
 */

import { $ } from "bun";

console.log("Starting Oppressor development servers...\n");

// Start backend with --watch for auto-reload
const backend = Bun.spawn(["bun", "--watch", "server/index.ts"], {
  stdout: "inherit",
  stderr: "inherit",
  env: { ...process.env, PORT: "3000" },
});

// Start Quasar dev server (Vite-powered)
const frontend = Bun.spawn(["bunx", "quasar", "dev"], {
  stdout: "inherit",
  stderr: "inherit",
  env: { ...process.env, VITE_API_URL: "http://localhost:3000" },
});

// Graceful shutdown
process.on("SIGINT", () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});

await Promise.all([backend.exited, frontend.exited]);
