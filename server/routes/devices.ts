import type { Database } from "bun:sqlite";
import { getHosts, blockDevice, unblockDevice } from "../services/fritzbox";

export async function deviceRoutes(req: Request, db: Database): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  // GET /api/devices — list all managed devices
  if (req.method === "GET" && path === "/api/devices") {
    const devices = db.query("SELECT * FROM devices ORDER BY name").all();
    return Response.json({ data: devices }, { headers });
  }

  // GET /api/devices/discover — scan Fritz!Box for connected hosts
  if (req.method === "GET" && path === "/api/devices/discover") {
    try {
      const hosts = await getHosts();
      return Response.json({ data: hosts }, { headers });
    } catch {
      return Response.json(
        { error: "Failed to reach Fritz!Box" },
        { status: 502, headers }
      );
    }
  }

  // POST /api/devices — add a device to manage
  if (req.method === "POST" && path === "/api/devices") {
    const body = await req.json();
    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO devices (id, name, mac, ip, hostname, device_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, body.name, body.mac, body.ip, body.hostname, body.deviceType]
    );
    return Response.json({ data: { id, ...body } }, { status: 201, headers });
  }

  // PATCH /api/devices/:id — rename a device
  const patchMatch = path.match(/^\/api\/devices\/([^/]+)$/);
  if (req.method === "PATCH" && patchMatch) {
    const { name } = await req.json();
    db.run("UPDATE devices SET name = ? WHERE id = ?", [name, patchMatch[1]!]);
    return Response.json({ data: { updated: true } }, { headers });
  }

  // DELETE /api/devices/:id — remove a managed device (cascades schedules)
  const deleteMatch = path.match(/^\/api\/devices\/([^/]+)$/);
  if (req.method === "DELETE" && deleteMatch) {
    db.run("DELETE FROM devices WHERE id = ?", [deleteMatch[1]!]);
    return Response.json({ data: { deleted: true } }, { headers });
  }

  // POST /api/devices/:id/block — immediate manual block
  const blockMatch = path.match(/^\/api\/devices\/([^/]+)\/block$/);
  if (req.method === "POST" && blockMatch) {
    const device = db.query("SELECT * FROM devices WHERE id = ?").get(blockMatch[1]!) as { mac: string } | null;
    if (!device) return Response.json({ error: "Not found" }, { status: 404, headers });

    const ok = await blockDevice(device.mac);
    return Response.json({ data: { blocked: ok } }, { headers });
  }

  // POST /api/devices/:id/unblock — immediate manual unblock
  const unblockMatch = path.match(/^\/api\/devices\/([^/]+)\/unblock$/);
  if (req.method === "POST" && unblockMatch) {
    const device = db.query("SELECT * FROM devices WHERE id = ?").get(unblockMatch[1]!) as { mac: string } | null;
    if (!device) return Response.json({ error: "Not found" }, { status: 404, headers });

    const ok = await unblockDevice(device.mac);
    return Response.json({ data: { unblocked: ok } }, { headers });
  }

  return Response.json({ error: "Not found" }, { status: 404, headers });
}
