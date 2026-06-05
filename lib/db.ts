import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://yelpcamp:yelpcamp@localhost:5432/yelpcamp";

// Serverless-safe settings:
// - prepare:false  → required for Neon's PgBouncer connection pooler
// - max:1          → each serverless invocation gets one connection
// - idle_timeout   → release connections quickly between invocations
const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});
export const db = drizzle(client, { schema });

export async function queryRaw<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return client.unsafe(sql, params as never[]) as Promise<T[]>;
}
