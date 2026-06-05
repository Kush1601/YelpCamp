import fs from "fs";
import path from "path";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://yelpcamp:yelpcamp@localhost:5432/yelpcamp";

async function main() {
  const sql = postgres(connectionString, { max: 1 });
  const file = path.join(process.cwd(), "sql", "001_init.sql");
  const migration = fs.readFileSync(file, "utf8");
  await sql.unsafe(migration);
  await sql.end();
  console.log("Migration applied:", file);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
