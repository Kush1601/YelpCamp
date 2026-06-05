import type { NextRequest } from "next/server";
import { geocodeLocation } from "@/lib/geocode";
import { queryRaw } from "@/lib/db";

const MILES_TO_METERS = 1609.34;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location")?.trim();
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const radiusMiles = Math.min(200, Math.max(1, parseFloat(searchParams.get("radiusMiles") ?? "25")));

  let lat: number;
  let lng: number;
  try {
    if (latParam && lngParam) {
      lat = parseFloat(latParam);
      lng = parseFloat(lngParam);
    } else if (location) {
      const geo = await geocodeLocation(location);
      lat = geo.lat;
      lng = geo.lng;
    } else {
      return Response.json({ error: "Provide location or lat/lng" }, { status: 400 });
    }
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }

  const radiusMeters = radiusMiles * MILES_TO_METERS;
  const start = Date.now();

  try {
    const results = await queryRaw<{
      id: string;
      title: string;
      location: string;
      price: number;
      distance_miles: number;
    }>(
      `SELECT id, title, location, price,
              (ST_Distance(
                geom,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
              ) / ${MILES_TO_METERS})::float AS distance_miles
       FROM campgrounds
       WHERE geom IS NOT NULL
         AND ST_DWithin(
           geom,
           ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
           $3
         )
       ORDER BY distance_miles ASC
       LIMIT 50`,
      [lng, lat, radiusMeters]
    );

    return Response.json({
      center: { lat, lng },
      radiusMiles,
      results,
      queryMs: Date.now() - start,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Nearby search failed" }, { status: 500 });
  }
}
