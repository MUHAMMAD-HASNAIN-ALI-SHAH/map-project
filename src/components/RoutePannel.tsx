import { useRef, useState } from "react";
import useMapStore from "../store/useMapStore.tsx";
import type { SearchResult, LocationPoint } from "../types/index.ts";
import { searchLocation } from "../services/locationService.ts";
import { getRoute } from "../services/routeService.ts";

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  return hours > 0
    ? `${hours} hr ${remainingMinutes} min`
    : `${remainingMinutes} min`;
}

const searchResults = ({
  search,
  onSelect,
}: {
  search: {
    results: SearchResult[];
    loading: boolean;
    error: string;
  };
  onSelect: (result: SearchResult) => void;
}) => {
  return (
    <>
      {(search.results.length > 0 || search.loading || search.error) && (
        <div className="border-t border-slate-100">
          {search.results.map((result, index) => (
            <button
              key={`${result.lat}-${result.lon}-${index}`}
              onClick={() => onSelect(result)}
              style={{ color: "#475569" }}
              className="flex w-full items-center gap-3 border-b border-slate-100 px-5 py-3 text-left text-slate-600 transition hover:bg-slate-50"
            >
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
            <div className="flex items-center justify-center gap-2 px-5 py-4 text-sm text-slate-600">
              Searching locations...
            </div>
          )}

          {search.error && !search.loading && (
            <p className="px-5 py-4 text-center text-sm text-slate-600">
              {search.error}
            </p>
          )}
        </div>
      )}
    </>
  );
};

const RoutePannel = ({ gps }: {
  gps: {
    currentLocation: [number, number] | null;
    tracking: boolean;
    heading: number | null;
    startTracking: () => void;
    stopTracking: () => void;
  }
}) => {
  const { setPannelScreen, routeStartingPoint, routeDestinationPoint, routeData, setRouteData, routeStarted } = useMapStore();

  const handleShowRoute = async () => {
    const route = await getRoute(routeStartingPoint!, routeDestinationPoint!);
    setRouteData(route);
  };

  const [startingPoint, setStartingPoint] = useState({
    query: "",
    results: [] as SearchResult[],
    loading: false,
    error: "",
  });

  const [destinationPoint, setDestinationPoint] = useState({
    query: "",
    results: [] as SearchResult[],
    loading: false,
    error: "",
  });

  const controllerRef = useRef<{
    startingPoint: AbortController | null;
    destinationPoint: AbortController | null;
  }>({
    startingPoint: null,
    destinationPoint: null,
  });

  async function handleSearch(
    searchQuery: string,
    field: "startingPoint" | "destinationPoint"
  ) {
    if (!searchQuery.trim()) return;

    const setSearch =
      field === "startingPoint"
        ? setStartingPoint
        : setDestinationPoint;

    controllerRef.current[field]?.abort();

    const controller = new AbortController();
    controllerRef.current[field] = controller;

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

  function selectLocation(
    result: SearchResult,
    field: "startingPoint" | "destinationPoint"
  ) {
    const point: LocationPoint = {
      name: result.display_name.split(",").slice(0, 2).join(","),
      lat: Number(result.lat),
      lon: Number(result.lon),
    };

    const setSearch =
      field === "startingPoint"
        ? setStartingPoint
        : setDestinationPoint;

    controllerRef.current[field]?.abort();
    controllerRef.current[field] = null;

    setSearch((prev) => ({
      ...prev,
      query: point.name,
      results: [],
      loading: false,
      error: "",
    }));

    // Store selection is handled through the existing store values.
    if (field === "startingPoint") {
      useMapStore.getState().setRouteStartingPoint(point);
    } else {
      useMapStore.getState().setRouteDestinationPoint(point);
    }
  }

  return (

    <div className="
    absolute
    top-3 left-1/2 -translate-x-1/2
    sm:top-5 sm:left-5 sm:translate-x-0
    lg:top-6 lg:left-10
    z-1000
    w-[calc(100%-24px)]
    sm:w-90
    lg:w-95
    max-h-[calc(100dvh-24px)]
    sm:max-h-[calc(100dvh-40px)]
    overflow-y-auto
    overscroll-contain
    rounded-2xl
    bg-white
    p-4 sm:p-5
    shadow-md
">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-600">
          Plan Your Route
        </h2>

        <button
          onClick={() => setPannelScreen("search")}
          title="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
        >
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
      </div>

      {/* Starting Point */}
      {!routeStarted && (
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Starting Point
          </label>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3 rounded-xl border border-slate-200 px-3 sm:px-4 py-3">
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

            <input
              type="text"
              value={startingPoint.query}
              onChange={(e) =>
                setStartingPoint((prev) => ({
                  ...prev,
                  query: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(startingPoint.query, "startingPoint");
                }
              }}
              readOnly={routeStarted}
              placeholder="Enter starting location"
              className="min-w-0 w-full flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />

            {!routeStartingPoint ? (
              <button
                onClick={() => handleSearch(startingPoint.query, "startingPoint")}
                disabled={!startingPoint.query.trim() || startingPoint.loading}
                title="Search starting location"
                className="shrink-0 text-slate-500 disabled:opacity-40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                title="Clear icon"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
              >
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
          </div>

          {searchResults({
            search: startingPoint,
            onSelect: (result) => selectLocation(result, "startingPoint"),
          })}

          {/* Current Location UI */}
          <button
            onClick={() => {
              if (gps.currentLocation) {
                const point = {
                  display_name: "Current Location",
                  lat: String(gps.currentLocation[0]),
                  lon: String(gps.currentLocation[1]),
                };

                selectLocation(point, "startingPoint");
              }
            }}
            disabled={!gps.currentLocation}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
            </svg>

            Use My Current Location
          </button>
        </div>
      )}

      {/* Destination */}
      {!routeStarted && (
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Destination
          </label>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3 rounded-xl border border-slate-200 px-3 sm:px-4 py-3">
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

            <input
              type="text"
              value={destinationPoint.query}
              onChange={(e) =>
                setDestinationPoint((prev) => ({
                  ...prev,
                  query: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(destinationPoint.query, "destinationPoint");
                }
              }}
              readOnly={routeStarted}
              placeholder="Enter destination"
              className="min-w-0 w-full flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />

            {!routeDestinationPoint ? (
              <button
                onClick={() => handleSearch(destinationPoint.query, "destinationPoint")}
                disabled={!destinationPoint.query.trim() || destinationPoint.loading}
                title="Search destination"
                className="shrink-0 text-slate-500 disabled:opacity-40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                title="Clear icon"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
              >
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
          </div>

          {searchResults({
            search: destinationPoint,
            onSelect: (result) => selectLocation(result, "destinationPoint"),
          })}
        </div>
      )}

      {/* Route Actions */}
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
        <button
          disabled={(!routeStartingPoint || !routeDestinationPoint) || routeStarted}
          onClick={handleShowRoute}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm sm:text-base font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-60"
        >
          Show Route →
        </button>

        {/* CLEAR */}
        <button
          onClick={() => {
            useMapStore.getState().setRouteStartingPoint(null);
            useMapStore.getState().setRouteDestinationPoint(null);

            setStartingPoint({
              query: "",
              results: [],
              loading: false,
              error: "",
            });

            setDestinationPoint({
              query: "",
              results: [],
              loading: false,
              error: "",
            });

            setRouteData(null);
          }}
          disabled={(!routeStartingPoint && !routeDestinationPoint) || routeStarted}
          className="w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
        >
          Clear All
        </button>
      </div>

      {/* Route Information */}
      {routeData && (
        <section className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 sm:p-4">
          <h3 className="mb-3 font-bold text-green-900">
            Route Information
          </h3>

          <div className="flex justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-600">
                Distance
              </p>

              <p className="text-xl font-bold text-slate-900">
                {routeData.distance.toFixed(1)} km
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-600">
                Estimated Time
              </p>

              <p className="text-xl font-bold text-slate-900">
                {formatTime(routeData.duration)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Start Route */}
      {routeData && !routeStarted && (
        <button
          onClick={() => {
            useMapStore.getState().setRouteStarted(true);
          }}
          className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-60"
        >
          Start Route
        </button>
      )}

      {/* End Route */}
      {routeData && routeStarted && (
        <button
          onClick={() => {
            useMapStore.getState().setRouteStarted(false);
          }}
          className="mt-5 w-full rounded-xl bg-red-600 py-3 font-bold text-white shadow-md hover:bg-red-700"
        >
          End Route
        </button>
      )}

    </div>

  );
};

export default RoutePannel;
