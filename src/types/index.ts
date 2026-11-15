export type LocationPoint = {
  name: string;
  lat: number;
  lon: number;
};

export type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export type RouteData = {
  coordinates: [number, number][];
  distance: number;
  duration: number;
};

export type Field = "start" | "destination";