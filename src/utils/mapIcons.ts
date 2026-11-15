import L from "leaflet";

const createIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width:18px;
        height:18px;
        border:3px solid white;
        border-radius:50%;
        background:${color};
        box-shadow:0 2px 8px #0005;
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

export const startIcon = createIcon("#16a34a");
export const destinationIcon = createIcon("#2563eb");

export const gpsIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:34px;
      height:34px;
      position:relative;
      filter:drop-shadow(0 2px 4px #0006);
    ">
      <div style="
        position:absolute;
        top:0;
        left:7px;
        width:0;
        height:0;
        border-left:10px solid transparent;
        border-right:10px solid transparent;
        border-bottom:28px solid #2563eb;
      "></div>

      <div style="
        position:absolute;
        bottom:0;
        left:11px;
        width:12px;
        height:12px;
        border:3px solid white;
        border-radius:50%;
        background:#2563eb;
      "></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});