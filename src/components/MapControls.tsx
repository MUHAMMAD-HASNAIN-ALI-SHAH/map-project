import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet/hooks";
import type { LocationPoint } from "../types/index.ts";
import useMapStore from "../store/useMapStore.tsx";

// Custom zoom controls for the map
export function CustomZoomControls() {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useEffect(() => {
        const updateZoom = () => {
            setZoom(map.getZoom());
        };

        map.on("zoomend", updateZoom);

        return () => {
            map.off("zoomend", updateZoom);
        };
    }, [map]);

    const minZoom = map.getMinZoom();
    const maxZoom = map.getMaxZoom();

    return (
        <div className="absolute bottom-40 right-4 z-1000 flex flex-col gap-2">

            {/* Zoom In */}
            <button
                onClick={() => map.zoomIn()}
                disabled={zoom >= maxZoom}
                title="Zoom In"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
                <span className="text-3xl font-light">+</span>
            </button>

            {/* Zoom Out */}
            <button
                onClick={() => map.zoomOut()}
                disabled={zoom <= minZoom}
                title="Zoom Out"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
                <span className="text-3xl font-light">−</span>
            </button>

        </div>
    );
}

// Navigation button to open the route panel
export function NavigationBarButton() {
    return (
        <button
            title="My current location"
            onClick={() => useMapStore.getState().setPannelScreen("route")}
            className="absolute rotate-30 bottom-24 right-4 z-1000 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                className="text-slate-600"
            >
                <path d="M12 2.5L19.2 21.5L12 17.2L4.8 21.5Z" />
                <path d="M12 2.5L12 17.2L4.8 21.5Z" />
            </svg>
        </button>
    );
}

// Button to go to the user's current location
export function CurrentLocationButton({
    startTracking,
    currentLocation,
}: {
    currentLocation: [number, number] | null;
    startTracking: () => void;
}) {
    const map = useMap();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentLocation) {
            setIsLoading(false);
        }
    }, [currentLocation]);

    function goToCurrentLocation() {
        if (!currentLocation) {
            setIsLoading(true);
            startTracking();
            return;
        }

        map.flyTo(currentLocation, 17, {
            animate: true,
            duration: 1,
        });
    }

    return (
        <button
            onClick={goToCurrentLocation}
            disabled={isLoading}
            title="My current location"
            className="absolute bottom-6 right-4 z-1000 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition hover:bg-blue-50 disabled:cursor-wait disabled:opacity-70"
        >
            {isLoading ? (
                <svg
                    className="h-6 w-6 animate-spin text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: "rotate(45deg)" }}
                >
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                </svg>
            )}
        </button>
    );
}

// Component to handle searching for a location and flying to it on the map
export function SearchLocationController({
    searchPoint,
    searchPointSelected,
}: {
    searchPoint: LocationPoint | null;
    searchPointSelected: boolean;
}) {
    const map = useMap();
    const hasMovedRef = useRef<boolean>(false);

    useEffect(() => {
        if (!searchPointSelected || !searchPoint) {
            hasMovedRef.current = false;
            return;
        }

        if (hasMovedRef.current) return;

        map.flyToBounds(
            [
                [searchPoint.lat, searchPoint.lon],
            ],
            {
                padding: [50, 50],
                maxZoom: 16,
                animate: true,
                duration: 1,
            }
        );

        hasMovedRef.current = true;
    }, [map, searchPoint, searchPointSelected]);

    return null;
}

// Component to track the user's current location and fly to it on the map when the route has started
export function TrackCurrentLocation({
    currentLocation,
    routeStarted,
}: {
    currentLocation: [number, number] | null;
    routeStarted: boolean;
}) {
    const map = useMap();

    useEffect(() => {
        if (!routeStarted || !currentLocation) return;

        map.flyTo(currentLocation, 18, {
            animate: true,
            duration: 0.7,
        });
    }, [map, currentLocation, routeStarted]);

    return null;
}

// Component to handle GPS navigation and rotate the map based on the user's heading
export function GPSNavigationController({
    location,
    heading,
}: {
    location: [number, number] | null;
    heading: number | null;
}) {
    const map = useMap();
    const hasFocused = useRef(false);

    useEffect(() => {
        if (!location || hasFocused.current) return;

        map.flyTo(location, 18, {
            animate: true,
            duration: 0.7,
        });

        hasFocused.current = true;
    }, [map, location]);

    useEffect(() => {
        const rotatingMap = map as typeof map & {
            setBearing: (degrees: number) => void;
        };

        if (heading !== null && Number.isFinite(heading)) {
            rotatingMap.setBearing(-heading);
        }
    }, [map, heading]);

    return null;
}