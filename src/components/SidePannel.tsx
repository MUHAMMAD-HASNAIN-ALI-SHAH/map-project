import SearchPanel from "./pannels/SearchPanel";
import useMapStore from "../store/useMapStore";
import RoutePannel from "./pannels/RoutePannel";

const SidePannel = ({ gps }: {
    gps: {
        currentLocation: [number, number] | null;
        tracking: boolean;
        heading: number | null;
        startTracking: () => void;
        stopTracking: () => void;
    }
}) => {
    const { pannelScreen } = useMapStore();
    return (
        <>
            {pannelScreen === "search" && <SearchPanel />}
            {pannelScreen === "route" && <RoutePannel gps={gps} />}
        </>
    )
}

export default SidePannel
