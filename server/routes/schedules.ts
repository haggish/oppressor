import { Database } from "bun:sqlite";

export async function scheduleRoutes(req: Request, db: Database): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  // GET /api/schedules — list all schedules
  if (req.method === "GET" && path === "/api/schedules") {
    const schedules = db
      .query(`
        SELECT s.*, d.name as device_name, d.mac
        FROM schedules s
        JOIN devices d ON d.id = s.device_id
        ORDER BY d.name
      `)
      .all();
    return Response.json({ data: schedules }, { headers });
  }

  // POST /api/schedules — create a new schedule
  if (req.method === "POST" && path === "/api/schedules") {
    const body = await req.json();
    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO schedules (id, device_id, block_from, block_until, days, enabled)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, body.deviceId, body.blockFrom, body.blockUntil, JSON.stringify(body.days), 1]
    );
    return Response.json({ data: { id, ...body } }, { status: 201, headers });
  }

  // PUT /api/schedules/:id/toggle — enable/disable
  const toggleMatch = path.match(/^\/api\/schedules\/([^/]+)\/toggle$/);
  if (req.method === "PUT" && toggleMatch) {
    db.run(
      `UPDATE schedules SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END WHERE id = ?`,
      [toggleMatch[1]!]
    );
    return Response.json({ data: { toggled: true } }, { headers });
  }

  // DELETE /api/schedules/:id
  const deleteMatch = path.match(/^\/api\/schedules\/([^/]+)$/);
  if (req.method === "DELETE" && deleteMatch) {
    db.run("DELETE FROM schedules WHERE id = ?", [deleteMatch[1]!]);
    return Response.json({ data: { deleted: true } }, { headers });
  }

  return Response.json({ error: "Not found" }, { status: 404, headers });
}
