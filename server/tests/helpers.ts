import { Database } from "bun:sqlite";
import { initDatabase } from "../db/database";

export function makeDb(): Database {
  const db = new Database(":memory:");
  initDatabase(db);
  return db;
}

export function req(method: string, path: string, body?: unknown): Request {
  return new Request(`http://localhost${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}
