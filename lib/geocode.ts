export async function geocodeLocation(location: string): Promise<{ lat: number; lng: number }> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "YelpCamp/2.0 (portfolio project)" },
  });
  const data = (await res.json()) as { lat: string; lon: string }[];
  if (!data.length) {
    throw new Error(`Location not found: "${location}"`);
  }
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}
