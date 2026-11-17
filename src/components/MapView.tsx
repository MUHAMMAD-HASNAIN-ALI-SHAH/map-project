import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
} from "react-leaflet";
import { gpsIcon, } from "../utils/mapIcons.ts";
import {
    CurrentLocationButton,
    CustomZoomControls,
    GPSNavigationController,
    NavigationBarButton,
    SearchLocationController,
} from "./MapControls.tsx";
import SidePannel from "./SidePannel.tsx";
import useMapStore from "../store/useMapStore.tsx";

export default function MapView({
    currentLocation,
    heading,
    startTracking,
    gps,
}: {
    currentLocation: [number, number] | null;
    heading: number | null;
    startTracking: () => void;
    gps: {
        currentLocation: [number, number] | null;
        tracking: boolean;
        heading: number | null;
        startTracking: () => void;
        stopTracking: () => void;
    }
}) {
    const { searchPoint, searchPointSelected, routeData } = useMapStore();

    return (
        <main className="relative min-h-0 flex-1">
            <MapContainer
                center={[30.1575, 71.5249]}
                zoom={6}
                zoomControl={false}
                scrollWheelZoom
                className="h-full w-full"
                rotate={true}
                touchRotate={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://mhas-map-mu.vercel.app/">MHAS Ride</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Search Location Marker */}
                <GPSNavigationController
                    location={currentLocation}
                    heading={heading}
                />

                <div className="flex flex-col gap-2 mb-10">
                    {/* Custom Zoom Controls */}
                    <CustomZoomControls />

                    {/* Navigation Button */}
                    <NavigationBarButton />

                    {/* Current Location Button */}
                    <CurrentLocationButton
                        startTracking={startTracking}
                        currentLocation={currentLocation}
                    />
                </div>

                {/* GPS Marker */}
                {currentLocation && (
                    <Marker position={currentLocation} icon={gpsIcon}>
                        <Popup>
                            <strong>Your Current Location</strong>
                            <br />
                            Live GPS Position
                        </Popup>
                    </Marker>
                )}

                {/* Search Location Marker */}
                <SearchLocationController
                    searchPoint={searchPoint}
                    searchPointSelected={searchPointSelected}
                />

                {/* Search Location Popup */}
                {searchPointSelected && searchPoint && (
                    <Marker
                        position={[searchPoint.lat, searchPoint.lon]}
                    >
                        <Popup>
                            <strong>{searchPoint.name}</strong>
                        </Popup>
                    </Marker>
                )}

                {/* Route Polyline */}
                {routeData && (
                    <Polyline
                        positions={routeData.coordinates}
                        pathOptions={{
                            color: "#2563eb",
                            weight: 5,
                            opacity: 0.8,
                        }}
                    />
                )}
            </MapContainer>

            <SidePannel gps={gps} />
        </main>
    );
}
