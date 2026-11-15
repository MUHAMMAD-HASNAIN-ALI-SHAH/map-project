import { create } from "zustand";
import type { RouteData } from "../types/index.ts";

interface MapStore {
    pannelScreen: "search" | "route";
    searchPoint: {
        name: string;
        lat: number;
        lon: number;
    } | null;
    searchPointSelected: boolean;
    routeStartingPoint: {
        name: string;
        lat: number;
        lon: number;
    } | null;
    routeDestinationPoint: {
        name: string;
        lat: number;
        lon: number;
    } | null;
    routeData: RouteData | null;
    routeStarted: boolean;

    setPannelScreen: (screen: "search" | "route") => void;
    setSearchPoint: (point: { name: string; lat: number; lon: number } | null) => void;
    setSearchPointSelected: (selected: boolean) => void;
    setRouteStartingPoint: (point: { name: string; lat: number; lon: number } | null) => void;
    setRouteDestinationPoint: (point: { name: string; lat: number; lon: number } | null) => void;
    setRouteData: (data: RouteData | null) => void;
    setRouteStarted: (started: boolean) => void;
}

const useMapStore = create<MapStore>()((set) => ({
    pannelScreen: "search",
    searchPoint: null,
    searchPointSelected: false,
    routeStartingPoint: null,
    routeDestinationPoint: null,
    routeData: null,
    routeStarted: false,

    setPannelScreen: (screen) => {
        set({ pannelScreen: screen });
        if(screen === "search") {
            set({ routeStartingPoint: null, routeDestinationPoint: null, routeData: null, routeStarted: false });
        }
    },
    setSearchPoint: (point) => set({ searchPoint: point }),
    setSearchPointSelected: (selected) => set({ searchPointSelected: selected }),
    setRouteStartingPoint: (point) => set({ routeStartingPoint: point }),
    setRouteDestinationPoint: (point) => set({ routeDestinationPoint: point }),
    setRouteData: (data) => set({ routeData: data }),
    setRouteStarted: (started) => set({ routeStarted: started }),
}))

export default useMapStore;
