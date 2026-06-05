"use client";

import dynamic from "next/dynamic";

const CampgroundMap = dynamic(() => import("./CampgroundMap").then((m) => m.CampgroundMap), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-xl bg-emerald-900/10" />,
});

export type MapPoint = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  location?: string;
};

export function CampgroundMapClient(props: {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  heightClass?: string;
}) {
  return <CampgroundMap {...props} />;
}
