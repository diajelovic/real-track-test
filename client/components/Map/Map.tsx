import React from "react";
import L from "leaflet";
import type { Icon, LatLngBoundsExpression, Marker } from "leaflet";

import styles from "./Map.styles.module.css";

import "leaflet/dist/leaflet.css";

const bounds: LatLngBoundsExpression = [
  [0, 0],
  [890, 1288],
];

interface HeroLocation {
  hero: string;
  house: string;
  x: number;
  y: number;
}

const createMap = (element: HTMLDivElement) => {
  const map = L.map(element, {
    crs: L.CRS.Simple,
    maxBounds: bounds,
  });

  L.imageOverlay("/images/map/map.png", bounds).addTo(map);

  map.fitBounds(bounds);

  return map;
};

export const Map: React.FC = React.memo(function Map() {
  const mapRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (mapRef.current) {
      const map = createMap(mapRef.current);
      const markers: Record<string, Marker> = {};
      const markerIcons: Record<string, Icon> = {};

      const ws = new WebSocket("ws://localhost:8081");

      const getMarkerIcon = (house: string) => {
        if (!markerIcons[house]) {
          markerIcons[house] = L.icon({
            iconUrl: `/images/coat-of-arms/${house}.png`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            tooltipAnchor: [20, 0],
          });
        }

        return markerIcons[house];
      };

      ws.addEventListener("message", (event: MessageEvent<string>) => {
        const { hero, house, x, y } = JSON.parse(event.data) as HeroLocation;

        if (!markers[hero]) {
          markers[hero] = L.marker([y, x], {
            icon: getMarkerIcon(house),
          })
            .bindTooltip(hero)
            .addTo(map);
        } else {
          markers[hero].setLatLng([y, x]);
        }
      });

      return () => {
        map.remove();
      };
    }
  }, []);

  return <div ref={mapRef} className={styles.map} />;
});
