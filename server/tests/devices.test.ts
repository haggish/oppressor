import { describe, expect, it, beforeEach } from "bun:test";
import { deviceRoutes } from "../routes/devices";
import { makeDb, req } from "./helpers";
import type { Database } from "bun:sqlite";

describe("device routes", () => {
  let db: Database;

  beforeEach(() => {
    db = makeDb();
  });

  it("GET /api/devices returns empty list initially", async () => {
    const res = await deviceRoutes(req("GET", "/api/devices"), db);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data).toEqual([]);
  });

  it("POST /api/devices adds a device", async () => {
    const res = await deviceRoutes(
      req("POST", "/api/devices", {
        name: "Matilda's Watch",
        mac: "AA:BB:CC:DD:EE:FF",
        ip: "192.168.178.42",
        hostname: "360-KIDSWATCH-X5PE",
        deviceType: "phone",
      }),
      db
    );
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.data.name).toBe("Matilda's Watch");
    expect(json.data.mac).toBe("AA:BB:CC:DD:EE:FF");
    expect(json.data.id).toBeDefined();
  });

  it("GET /api/devices returns the added device", async () => {
    await deviceRoutes(
      req("POST", "/api/devices", { name: "Laptop", mac: "11:22:33:44:55:66", ip: null, hostname: null, deviceType: null }),
      db
    );
    const res = await deviceRoutes(req("GET", "/api/devices"), db);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.data[0].name).toBe("Laptop");
  });

  it("PATCH /api/devices/:id renames a device", async () => {
    const addRes = await deviceRoutes(
      req("POST", "/api/devices", { name: "Old Name", mac: "AA:BB:CC:DD:EE:FF", ip: null, hostname: null, deviceType: null }),
      db
    );
    const { data } = await addRes.json();

    const patchRes = await deviceRoutes(
      req("PATCH", `/api/devices/${data.id}`, { name: "New Name" }),
      db
    );
    expect(patchRes.status).toBe(200);

    const listRes = await deviceRoutes(req("GET", "/api/devices"), db);
    const list = await listRes.json();
    expect(list.data[0].name).toBe("New Name");
  });

  it("DELETE /api/devices/:id removes a device", async () => {
    const addRes = await deviceRoutes(
      req("POST", "/api/devices", { name: "To Delete", mac: "AA:BB:CC:DD:EE:FF", ip: null, hostname: null, deviceType: null }),
      db
    );
    const { data } = await addRes.json();

    const delRes = await deviceRoutes(req("DELETE", `/api/devices/${data.id}`), db);
    expect(delRes.status).toBe(200);

    const listRes = await deviceRoutes(req("GET", "/api/devices"), db);
    const list = await listRes.json();
    expect(list.data).toHaveLength(0);
  });

  it("POST /api/devices/:id/block returns 404 for unknown device", async () => {
    const res = await deviceRoutes(req("POST", "/api/devices/nonexistent/block"), db);
    expect(res.status).toBe(404);
  });

  it("POST /api/devices/:id/unblock returns 404 for unknown device", async () => {
    const res = await deviceRoutes(req("POST", "/api/devices/nonexistent/unblock"), db);
    expect(res.status).toBe(404);
  });

  it("returns 404 for unknown routes", async () => {
    const res = await deviceRoutes(req("GET", "/api/devices/unknown/action"), db);
    expect(res.status).toBe(404);
  });
});
