import type { RouteData, LocationPoint } from "../types/index.ts";

export async function getRoute(
  start: LocationPoint,
  destination: LocationPoint
): Promise<RouteData> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${start.lon},${start.lat};${destination.lon},${destination.lat}` +
    `?overview=full&geometries=geojson`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Route request failed");
  }

  const data = await response.json();

  if (!data.routes?.length) {
    throw new Error("No route found");
  }

  const selectedRoute = data.routes[0];

  const coordinates: [number, number][] =
    selectedRoute.geometry.coordinates.map(
      ([lon, lat]: [number, number]) => [lat, lon]
    );

  return {
    coordinates,
    distance: selectedRoute.distance / 1000,
    duration: selectedRoute.duration / 60,
  };
}