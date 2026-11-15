import type { SearchResult } from "../types/index.ts";

export async function searchLocation(
    query: string,
    signal?: AbortSignal
): Promise<SearchResult[]> {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=pk&q=${encodeURIComponent(query)}`,
        { signal }
    );

    if (!response.ok) {
        throw new Error("Location search failed");
    }

    return response.json();
}