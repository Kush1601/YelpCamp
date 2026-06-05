"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Point = { id: string; title: string; lat: number; lng: number; location?: string };

export function CampgroundMap({
  points,
  center,
  zoom = 6,
  heightClass = "h-72",
}: {
  points: Point[];
  center?: [number, number];
  zoom?: number;
  heightClass?: string;
}) {
  const mapCenter: [number, number] =
    center ?? (points[0] ? [points[0].lat, points[0].lng] : [39.5, -98.35]);

  return (
    <div className={`${heightClass} w-full overflow-hidden rounded-xl border border-emerald-900/10`}>
      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
            <Popup>
              <strong>{p.title}</strong>
              {p.location ? <div className="text-xs">{p.location}</div> : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
