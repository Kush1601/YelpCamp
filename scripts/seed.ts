import postgres from "postgres";

const SAMPLE_CITIES = [
  { city: "Boulder", state: "Colorado", lat: 40.015, lng: -105.2705 },
  { city: "Portland", state: "Oregon", lat: 45.5152, lng: -122.6784 },
  { city: "Asheville", state: "North Carolina", lat: 35.5951, lng: -82.5515 },
  { city: "Moab", state: "Utah", lat: 38.5733, lng: -109.5498 },
  { city: "Bend", state: "Oregon", lat: 44.0582, lng: -121.3153 },
  { city: "Flagstaff", state: "Arizona", lat: 35.1983, lng: -111.6513 },
  { city: "Bozeman", state: "Montana", lat: 45.677, lng: -111.0429 },
  { city: "Sedona", state: "Arizona", lat: 34.8697, lng: -111.761 },
];

const DESCRIPTORS = ["Forest", "Misty", "Redwood", "Cascade", "Silent", "Elk", "Rocky", "Pines"];
const PLACES = ["Flats", "Canyon", "River", "Backcountry", "Creek", "Bay", "Hollow", "Ridge"];

const connectionString =
  process.env.DATABASE_URL ?? "postgres://yelpcamp:yelpcamp@localhost:5432/yelpcamp";
const COUNT = parseInt(process.env.SEED_COUNT ?? "120", 10);
const OWNER_ID = process.env.SEED_OWNER_ID ?? "user_seed_owner";

const DESCRIPTIONS = [
  "Shaded sites near the trailhead with fire rings, vault toilets, and bear boxes. Great basecamp for weekend hikes.",
  "Riverside campground with direct creek access, fishing spots, and mountain views. Quiet after 9 PM.",
  "Open meadow sites with panoramic ridgeline views. Dry pit toilets, no hookups. Stars are stunning.",
  "Dense forest canopy keeps sites cool. Water spigots, picnic tables, fire grates. Dog-friendly.",
  "Desert canyon camping with red-rock formations. Minimal facilities — pack in, pack out.",
  "High-elevation alpine meadow. Short season (June–Sept). No fires above treeline.",
  "Wooded creek-side spots. First-come first-served. Excellent for kayaking and swimming.",
  "Remote backcountry access. 4WD required in wet weather. No reservations.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sampleCampground(i: number) {
  const c = SAMPLE_CITIES[i % SAMPLE_CITIES.length];
  const title = `${pick(DESCRIPTORS)} ${pick(PLACES)} Campground #${i + 1}`;
  const location = `${c.city}, ${c.state}`;
  const description = pick(DESCRIPTIONS);
  const price = 15 + Math.floor(Math.random() * 35);
  const jitterLat = c.lat + (Math.random() - 0.5) * 0.4;
  const jitterLng = c.lng + (Math.random() - 0.5) * 0.4;
  return { title, location, description, price, lat: jitterLat, lng: jitterLng };
}

async function main() {
  const sql = postgres(connectionString, { max: 1 });

  await sql`DELETE FROM campground_images`;
  await sql`DELETE FROM reviews`;
  await sql`DELETE FROM campgrounds`;

  const imageUrl =
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80";

  for (let i = 0; i < COUNT; i++) {
    const cg = sampleCampground(i);

    const rows = await sql<{ id: string }[]>`
      INSERT INTO campgrounds (title, description, price, location, owner_id, views, geom)
      VALUES (
        ${cg.title},
        ${cg.description},
        ${cg.price},
        ${cg.location},
        ${OWNER_ID},
        ${Math.floor(Math.random() * 500)},
        ST_SetSRID(ST_MakePoint(${cg.lng}, ${cg.lat}), 4326)::geography
      )
      RETURNING id
    `;
    const id = rows[0].id;

    await sql`
      INSERT INTO campground_images (campground_id, url, filename)
      VALUES (${id}, ${imageUrl}, ${`seed-${i}`})
    `;

    if (i % 4 === 0) {
      const daysAgo = i % 14;
      await sql`
        INSERT INTO reviews (body, rating, campground_id, author_id, author_name, created_at)
        VALUES (
          ${"Quiet sites and clean facilities. Would return."},
          ${4 + (i % 2)},
          ${id},
          ${"user_reviewer"},
          ${"Demo Camper"},
          NOW() - (${daysAgo} || ' days')::interval
        )
      `;
    }
  }

  await sql`REFRESH MATERIALIZED VIEW campground_review_stats`;
  await sql.end();
  console.log(`Seeded ${COUNT} campgrounds (owner_id=${OWNER_ID})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
