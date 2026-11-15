import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
} from "react-leaflet";
import { gpsIcon, } from "../../utils/mapIcons.ts";
import {
    CurrentLocationButton,
    CustomZoomControls,
    GPSNavigationController,
    NavigationBarButton,
    SearchLocationController,
    TrackCurrentLocation,
} from "./MapControls.tsx";
import SidePannel from "../SidePannel.tsx";
import useMapStore from "../../store/useMapStore.tsx";





type Props = {
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
};

export default function MapView({
    currentLocation,
    heading,
    startTracking,
    gps,
}: Props) {
    const { searchPoint, searchPointSelected, routeData, routeStarted } = useMapStore();

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
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {
                    routeStarted && (
                        <TrackCurrentLocation
                            currentLocation={currentLocation}
                            routeStarted={routeStarted}
                        />
                    )

                }

                <GPSNavigationController
                    location={currentLocation}
                    heading={heading}
                />

                <CustomZoomControls />

                <CurrentLocationButton
                    startTracking={startTracking}
                    currentLocation={currentLocation}
                />

                <NavigationBarButton />

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

                {searchPointSelected && searchPoint && (
                    <Marker
                        position={[searchPoint.lat, searchPoint.lon]}
                    >
                        <Popup>
                            <strong>{searchPoint.name}</strong>
                        </Popup>
                    </Marker>
                )}

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
