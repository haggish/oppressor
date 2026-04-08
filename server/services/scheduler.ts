import { Database } from "bun:sqlite";
import { blockDevice, unblockDevice } from "./fritzbox";
import type { DayOfWeek } from "../../src/types";

const DAY_MAP: Record<number, DayOfWeek> = {
  0: "sun", 1: "mon", 2: "tue", 3: "wed",
  4: "thu", 5: "fri", 6: "sat",
};

export class Scheduler {
  private db: Database;
  private interval: ReturnType<typeof setInterval> | null = null;

  constructor(db: Database) {
    this.db = db;
  }

  start() {
    // Check every 60 seconds
    this.interval = setInterval(() => this.tick(), 60_000);
    console.log("Scheduler started — checking every 60s");
    // Run immediately on start
    this.tick();
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  private async tick() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const today = DAY_MAP[now.getDay()];

    const schedules = this.db
      .query(`
        SELECT s.*, d.mac, d.name as device_name
        FROM schedules s
        JOIN devices d ON d.id = s.device_id
        WHERE s.enabled = 1
      `)
      .all() as Array<{
        id: string; device_id: string; mac: string; device_name: string;
        block_from: string; block_until: string; days: string; enabled: number;
      }>;

    for (const schedule of schedules) {
      const days: DayOfWeek[] = JSON.parse(schedule.days);
      if (!today || !days.includes(today)) continue;

      const shouldBlock = this.isInBlockWindow(
        currentTime, schedule.block_from, schedule.block_until
      );

      if (shouldBlock) {
        const ok = await blockDevice(schedule.mac);
        if (ok) this.log(schedule.device_id, "blocked");
      } else {
        const ok = await unblockDevice(schedule.mac);
        if (ok) this.log(schedule.device_id, "unblocked");
      }
    }
  }

  /** Handles overnight windows like 23:00 → 06:00 */
  private isInBlockWindow(current: string, from: string, until: string): boolean {
    if (from <= until) {
      // Same-day window: e.g. 09:00 → 17:00
      return current >= from && current < until;
    } else {
      // Overnight window: e.g. 23:00 → 06:00
      return current >= from || current < until;
    }
  }

  private log(deviceId: string, action: string) {
    this.db.run(
      `INSERT INTO block_log (device_id, action) VALUES (?, ?)`,
      [deviceId, action]
    );
  }
}
