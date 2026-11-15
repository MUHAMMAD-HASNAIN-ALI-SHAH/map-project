import { useCallback, useEffect, useRef, useState } from "react";

export function useGPS() {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  const [tracking, setTracking] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState("");

  const watchId = useRef<number | null>(null);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setTracking(false);
    setHeading(null);
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("GPS is not supported by this browser.");
      return;
    }

    if (watchId.current !== null) return;

    setGpsError("");
    setTracking(true);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy,
          heading: gpsHeading,
        } = position.coords;

        setCurrentLocation([latitude, longitude]);
        setGpsAccuracy(accuracy);

        if (gpsHeading !== null && Number.isFinite(gpsHeading)) {
          setHeading(gpsHeading);
        }
      },
      (error) => {
        setGpsError(
          error.code === 1
            ? "Location permission denied. Allow location access."
            : error.code === 2
              ? "GPS position unavailable. Try outdoors."
              : "GPS timed out. Please try again."
        );

        stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 20000,
      }
    );
  }, [stopTracking]);

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const clearCurrentLocation = useCallback(() => {
    setCurrentLocation(null);
    setGpsAccuracy(null);
    setHeading(null);
  }, []);

  return {
    currentLocation,
    tracking,
    gpsAccuracy,
    heading,
    gpsError,
    startTracking,
    stopTracking,
    clearCurrentLocation,
  };
}