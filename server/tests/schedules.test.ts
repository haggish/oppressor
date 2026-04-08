import { describe, expect, it, beforeEach } from "bun:test";
import { scheduleRoutes } from "../routes/schedules";
import { deviceRoutes } from "../routes/devices";
import { makeDb, req } from "./helpers";
import type { Database } from "bun:sqlite";

describe("schedule routes", () => {
  let db: Database;
  let deviceId: string;

  beforeEach(async () => {
    db = makeDb();
    // Seed a device to attach schedules to
    const res = await deviceRoutes(
      req("POST", "/api/devices", {
        name: "Test Device",
        mac: "AA:BB:CC:DD:EE:FF",
        ip: "192.168.1.2",
        hostname: "test-device",
        deviceType: null,
      }),
      db
    );
    const json = await res.json();
    deviceId = json.data.id;
  });

  it("GET /api/schedules returns empty list initially", async () => {
    const res = await scheduleRoutes(req("GET", "/api/schedules"), db);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toEqual([]);
  });

  it("POST /api/schedules creates a schedule", async () => {
    const res = await scheduleRoutes(
      req("POST", "/api/schedules", {
        deviceId,
        blockFrom: "22:00",
        blockUntil: "07:00",
        days: ["mon", "tue", "wed", "thu", "fri"],
      }),
      db
    );
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.data.id).toBeDefined();
    expect(json.data.deviceId).toBe(deviceId);
  });

  it("GET /api/schedules returns the created schedule with device info", async () => {
    await scheduleRoutes(
      req("POST", "/api/schedules", {
        deviceId,
        blockFrom: "22:00",
        blockUntil: "07:00",
        days: ["mon"],
      }),
      db
    );
    const res = await scheduleRoutes(req("GET", "/api/schedules"), db);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.data[0].block_from).toBe("22:00");
    expect(json.data[0].block_until).toBe("07:00");
    expect(json.data[0].device_name).toBe("Test Device");
    expect(json.data[0].enabled).toBe(1);
  });

  it("PUT /api/schedules/:id/toggle disables an enabled schedule", async () => {
    const createRes = await scheduleRoutes(
      req("POST", "/api/schedules", { deviceId, blockFrom: "20:00", blockUntil: "08:00", days: ["sat"] }),
      db
    );
    const { data } = await createRes.json();

    await scheduleRoutes(req("PUT", `/api/schedules/${data.id}/toggle`), db);

    const listRes = await scheduleRoutes(req("GET", "/api/schedules"), db);
    const list = await listRes.json();
    expect(list.data[0].enabled).toBe(0);
  });

  it("PUT /api/schedules/:id/toggle re-enables a disabled schedule", async () => {
    const createRes = await scheduleRoutes(
      req("POST", "/api/schedules", { deviceId, blockFrom: "20:00", blockUntil: "08:00", days: ["sat"] }),
      db
    );
    const { data } = await createRes.json();

    await scheduleRoutes(req("PUT", `/api/schedules/${data.id}/toggle`), db);
    await scheduleRoutes(req("PUT", `/api/schedules/${data.id}/toggle`), db);

    const listRes = await scheduleRoutes(req("GET", "/api/schedules"), db);
    const list = await listRes.json();
    expect(list.data[0].enabled).toBe(1);
  });

  it("DELETE /api/schedules/:id removes the schedule", async () => {
    const createRes = await scheduleRoutes(
      req("POST", "/api/schedules", { deviceId, blockFrom: "21:00", blockUntil: "06:00", days: ["sun"] }),
      db
    );
    const { data } = await createRes.json();

    const delRes = await scheduleRoutes(req("DELETE", `/api/schedules/${data.id}`), db);
    expect(delRes.status).toBe(200);

    const listRes = await scheduleRoutes(req("GET", "/api/schedules"), db);
    const list = await listRes.json();
    expect(list.data).toHaveLength(0);
  });

  it("schedules are cascade-deleted when their device is removed", async () => {
    await scheduleRoutes(
      req("POST", "/api/schedules", { deviceId, blockFrom: "22:00", blockUntil: "07:00", days: ["mon"] }),
      db
    );

    await deviceRoutes(req("DELETE", `/api/devices/${deviceId}`), db);

    const res = await scheduleRoutes(req("GET", "/api/schedules"), db);
    const json = await res.json();
    expect(json.data).toHaveLength(0);
  });
});
