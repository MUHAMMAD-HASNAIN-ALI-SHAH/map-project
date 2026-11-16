import MapView from "./components/MapView";
import { useGPS } from "./hooks/useGPS";

function App() {
  const gps = useGPS();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-100 md:flex-row">

      {/* MAP */}
      <MapView
        currentLocation={gps.currentLocation}
        heading={gps.heading}
        startTracking={gps.startTracking}
        gps={gps}
      />

    </div>
  );
}

export default App;
