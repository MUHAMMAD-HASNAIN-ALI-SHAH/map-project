
import { useState, useRef } from "react";
import type { SearchResult, LocationPoint } from "../../types/index.ts";
import useMapStore from "../../store/useMapStore.tsx";
import { searchLocation } from "../../services/locationService.ts";

const SearchPanel = () => {
    const { setPannelScreen, setSearchPoint, searchPointSelected, setSearchPointSelected } =
        useMapStore();


    const [search, setSearch] = useState({
        query: "",
        results: [] as SearchResult[],
        loading: false,
        error: "",
    });

    const controllerRef = useRef<AbortController | null>(null);

    async function handleSearch(searchQuery: string) {
        if (searchPointSelected || !searchQuery.trim()) return;

        controllerRef.current?.abort();

        const controller = new AbortController();
        controllerRef.current = controller;

        setSearch((prev) => ({
            ...prev,
            results: [],
            loading: true,
            error: "",
        }));

        try {
            const data = await searchLocation(
                searchQuery,
                controller.signal
            );

            if (!controller.signal.aborted) {
                setSearch((prev) => ({
                    ...prev,
                    results: data,
                    error: data.length === 0 ? "No locations found" : "",
                }));
            }
        } catch (error) {
            if (
                error instanceof Error &&
                error.name !== "AbortError"
            ) {
                setSearch((prev) => ({
                    ...prev,
                    error: "Something went wrong. Try again.",
                }));
            }
        } finally {
            if (!controller.signal.aborted) {
                setSearch((prev) => ({
                    ...prev,
                    loading: false,
                }));
            }
        }
    }

    function selectLocation(result: SearchResult) {
        const point: LocationPoint = {
            name: result.display_name
                .split(",")
                .slice(0, 2)
                .join(","),
            lat: Number(result.lat),
            lon: Number(result.lon),
        };

        controllerRef.current?.abort();

        setSearch((prev) => ({
            ...prev,
            query: point.name,
            results: [],
            loading: false,
            error: "",
        }));

        setSearchPoint(point);
        setSearchPointSelected(true);
    }

    return (
        <div className="absolute left-10 top-6 z-1000 w-95 rounded-2xl bg-white shadow-md">

            {/* Search Bar */}
            <div className="flex items-center gap-3 px-6 py-4">

                <input
                    type="text"
                    value={search.query}
                    onChange={(e) =>
                        setSearch((prev) => ({
                            ...prev,
                            query: e.target.value,
                        }))
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch(search.query);
                        }
                    }}
                    placeholder="Search for a location"
                    readOnly={searchPointSelected}
                    style={{
                        color: "#475569",
                        cursor: searchPointSelected ? "not-allowed" : "text",
                    }}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600"
                />

                {!searchPointSelected ? (
                    <button
                        onClick={() => handleSearch(search.query)}
                        disabled={!search.query.trim() || search.loading}
                        title="Search location"
                        className="text-slate-600 transition disabled:opacity-40"
                    >
                        {/* Search Icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#475569"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>
                ) : (
                    <button
                        type="button"
                        title="Clear icon"
                        onClick={() => {
                            setSearchPointSelected(false);
                            setSearchPoint(null);
                            setSearch((prev) => ({
                                ...prev,
                                query: "",
                                results: [],
                                loading: false,
                                error: "",
                            }));
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                    >
                        {/* Cross Icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#475569"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <path d="m18 6-12 12" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                )}

                {searchPointSelected && <button
                    onClick={() => setPannelScreen("route")}
                    title="Switch to route view"
                    style={{ color: "#475569" }}
                    className="rotate-30 text-slate-600 hover:text-slate-600"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="23"
                        height="23"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#475569"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    >
                        <path d="M12 2.5L19.2 21.5L12 17.2L4.8 21.5Z" />
                        <path d="M12 2.5L12 17.2L4.8 21.5Z" />
                    </svg>
                </button>}
            </div>

            {/* Search Results */}
            {(search.results.length > 0 || search.loading || search.error) && (
                <div className="border-t border-slate-100">

                    {search.results.map((result, index) => (
                        <button
                            key={`${result.lat}-${result.lon}-${index}`}
                            onClick={() => selectLocation(result)}
                            style={{ color: "#475569" }}
                            className="flex w-full items-center gap-3 border-b border-slate-100 px-5 py-3 text-left text-slate-600 transition hover:bg-slate-50"
                        >
                            {/* Location Pin */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="21"
                                height="21"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#475569"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="shrink-0"
                            >
                                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                                <circle cx="12" cy="10" r="2.5" />
                            </svg>

                            <span className="text-sm text-slate-600">
                                {result.display_name}
                            </span>
                        </button>
                    ))}

                    {search.loading && (
                        <div
                            style={{ color: "#475569" }}
                            className="flex items-center justify-center gap-2 px-5 py-4 text-sm text-slate-600"
                        >
                            <svg
                                className="h-4 w-4 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                    stroke="#475569"
                                    strokeWidth="3"
                                    opacity="0.2"
                                />
                                <path
                                    d="M21 12a9 9 0 0 0-9-9"
                                    stroke="#475569"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                            </svg>

                            Searching locations...
                        </div>
                    )}

                    {search.error && !search.loading && (
                        <p
                            style={{ color: "#475569" }}
                            className="px-5 py-4 text-center text-sm text-slate-600"
                        >
                            {search.error}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchPanel;
