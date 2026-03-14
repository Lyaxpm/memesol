import Database from "better-sqlite3";
import { DB_PATH } from "../config/constants.js";
import { schemaSql } from "./schema.js";

export function initDb(path = DB_PATH) {
  const db = new Database(path);
  db.exec(schemaSql);
  return db;
}
