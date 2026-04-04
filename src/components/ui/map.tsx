"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  CircleMarker,
  useMap,
} from "react-leaflet";
import type {
  MapContainerProps,
  TileLayerProps,
  MarkerProps,
  CircleMarkerProps,
} from "react-leaflet";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";

/* ── Map ────────────────────────────────────────────────────── */

interface MapProps extends Omit<MapContainerProps, "children"> {
  children?: ReactNode;
  className?: string;
}

function Map({ children, className, ...props }: MapProps) {
  return (
    <MapContainer
      className={className}
      style={{ width: "100%", height: "100%" }}
      {...props}
    >
      {children}
    </MapContainer>
  );
}

/* ── TileLayer ──────────────────────────────────────────────── */

const DEFAULT_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const DEFAULT_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function MapTileLayer(props: Partial<TileLayerProps>) {
  return (
    <TileLayer
      attribution={DEFAULT_ATTRIBUTION}
      url={DEFAULT_URL}
      {...props}
    />
  );
}

/* ── Marker ─────────────────────────────────────────────────── */

interface MapMarkerProps extends MarkerProps {
  children?: ReactNode;
}

function MapMarker({ children, ...props }: MapMarkerProps) {
  return <Marker {...props}>{children}</Marker>;
}

/* ── CircleMarker ───────────────────────────────────────────── */

interface MapCircleMarkerProps extends CircleMarkerProps {
  children?: ReactNode;
}

function MapCircleMarker({ children, ...props }: MapCircleMarkerProps) {
  return <CircleMarker {...props}>{children}</CircleMarker>;
}

/* ── Popup ──────────────────────────────────────────────────── */

interface MapPopupProps {
  children?: ReactNode;
}

function MapPopup({ children }: MapPopupProps) {
  return <Popup>{children}</Popup>;
}

/* ── ZoomControl ────────────────────────────────────────────── */

function MapZoomControl() {
  return <ZoomControl position="topright" />;
}

/* ── useMap re-export ───────────────────────────────────────── */

export {
  Map,
  MapTileLayer,
  MapMarker,
  MapCircleMarker,
  MapPopup,
  MapZoomControl,
  useMap,
};
