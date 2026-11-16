import SearchPanel from "./SearchPanel";
import useMapStore from "../store/useMapStore";
import RoutePannel from "./RoutePannel";

const SidePannel = ({ gps }: {
    gps: {
        currentLocation: [number, number] | null;
        tracking: boolean;
        heading: number | null;
        startTracking: () => void;
        stopTracking: () => void;
    }
}) => {
    return (
        <>
            {useMapStore.getState().pannelScreen === "search" && <SearchPanel />}
            {useMapStore.getState().pannelScreen === "route" && <RoutePannel gps={gps} />}
        </>
    )
}

export default SidePannel
