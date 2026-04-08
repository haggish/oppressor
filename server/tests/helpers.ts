import { Database } from "bun:sqlite";
import { initDatabase } from "../db/database";

export function makeDb(): Database {
  const db = new Database(":memory:");
  initDatabase(db);
  return db;
}

export function req(method: string, path: string, body?: unknown): Request {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  return new Request(`http://localhost${path}`, init);
}
