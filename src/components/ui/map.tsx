"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
  type ReactElement,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  CircleMarker,
  LayerGroup,
  useMap,
} from "react-leaflet";
import type {
  MapContainerProps,
  TileLayerProps,
  MarkerProps,
  CircleMarkerProps,
} from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
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

interface MapTileLayerProps extends Partial<TileLayerProps> {
  name?: string;
  darkUrl?: string;
}

function MapTileLayer({ name, darkUrl, ...props }: MapTileLayerProps) {
  const ctx = useContext(LayersContext);

  // If inside a MapLayers context with named tile layers, only render if active
  if (ctx && name) {
    if (ctx.activeTileLayer !== name) return null;
  }

  return (
    <TileLayer
      attribution={DEFAULT_ATTRIBUTION}
      url={DEFAULT_URL}
      {...props}
    />
  );
}

/* ── Marker ─────────────────────────────────────────────────── */

interface MapMarkerProps extends Omit<MarkerProps, "icon"> {
  children?: ReactNode;
  icon?: ReactElement;
}

function MapMarker({ children, icon, ...props }: MapMarkerProps) {
  const leafletIcon = useMemo(() => {
    if (!icon) return undefined;
    const html = renderToStaticMarkup(icon);
    return L.divIcon({
      html,
      className: "shadcn-map-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, [icon]);

  return (
    <Marker icon={leafletIcon} {...props}>
      {children}
    </Marker>
  );
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
  className?: string;
}

function MapPopup({ children, className }: MapPopupProps) {
  return <Popup className={className}>{children}</Popup>;
}

/* ── ZoomControl ────────────────────────────────────────────── */

function MapZoomControl() {
  return <ZoomControl position="topright" />;
}

/* ── FullscreenControl ──────────────────────────────────────── */

function MapFullscreenControl() {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFSChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  const toggle = useCallback(() => {
    const container = map.getContainer();
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [map]);

  // Invalidate map size after fullscreen transition
  useEffect(() => {
    const timeout = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(timeout);
  }, [isFullscreen, map]);

  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: 10, marginLeft: 10 }}>
      <div className="leaflet-control leaflet-bar">
        <a
          href="#"
          role="button"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={(e) => {
            e.preventDefault();
            toggle();
          }}
          style={{ width: 30, height: 30, lineHeight: "30px", textAlign: "center", fontSize: 16 }}
        >
          {isFullscreen ? "⊟" : "⊞"}
        </a>
      </div>
    </div>
  );
}

/* ── ControlContainer ───────────────────────────────────────── */

interface MapControlContainerProps {
  children?: ReactNode;
  className?: string;
}

function MapControlContainer({ children, className }: MapControlContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Prevent map interactions when interacting with the control
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, []);

  return (
    <div
      ref={ref}
      className={`absolute z-[1000] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/* ── Layers system ──────────────────────────────────────────── */

interface LayersContextValue {
  /** Currently visible tile layer name (undefined = default) */
  activeTileLayer: string | undefined;
  setActiveTileLayer: (name: string | undefined) => void;
  /** Set of visible overlay group names */
  activeGroups: Set<string>;
  toggleGroup: (name: string) => void;
  /** Registered tile layer names (for the control UI) */
  tileLayerNames: string[];
  registerTileLayer: (name: string) => void;
  /** Registered overlay group names (for the control UI) */
  groupNames: string[];
  registerGroup: (name: string) => void;
}

const LayersContext = createContext<LayersContextValue | null>(null);

interface MapLayersProps {
  children?: ReactNode;
  /** Names of layer groups visible by default */
  defaultLayerGroups?: string[];
}

function MapLayers({ children, defaultLayerGroups }: MapLayersProps) {
  const [activeTileLayer, setActiveTileLayer] = useState<string | undefined>(undefined);
  const [activeGroups, setActiveGroups] = useState<Set<string>>(
    () => new Set(defaultLayerGroups ?? []),
  );
  const [tileLayerNames, setTileLayerNames] = useState<string[]>([]);
  const [groupNames, setGroupNames] = useState<string[]>([]);

  const toggleGroup = useCallback((name: string) => {
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const registerTileLayer = useCallback((name: string) => {
    setTileLayerNames((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }, []);

  const registerGroup = useCallback((name: string) => {
    setGroupNames((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }, []);

  const value = useMemo<LayersContextValue>(
    () => ({
      activeTileLayer,
      setActiveTileLayer,
      activeGroups,
      toggleGroup,
      tileLayerNames,
      registerTileLayer,
      groupNames,
      registerGroup,
    }),
    [activeTileLayer, activeGroups, tileLayerNames, groupNames, toggleGroup, registerTileLayer, registerGroup],
  );

  return <LayersContext.Provider value={value}>{children}</LayersContext.Provider>;
}

/* ── LayersControl ──────────────────────────────────────────── */

function MapLayersControl() {
  const ctx = useContext(LayersContext);
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, []);

  if (!ctx) return null;

  const { activeTileLayer, setActiveTileLayer, activeGroups, toggleGroup, tileLayerNames, groupNames } = ctx;

  return (
    <div ref={ref} className="leaflet-top leaflet-right" style={{ marginTop: 10, marginRight: 10 }}>
      <div className="leaflet-control leaflet-bar">
        <a
          href="#"
          role="button"
          title="Layers"
          aria-label="Layers"
          onClick={(e) => {
            e.preventDefault();
            setOpen((v) => !v);
          }}
          style={{ width: 30, height: 30, lineHeight: "30px", textAlign: "center", fontSize: 16 }}
        >
          ◫
        </a>
      </div>
      {open && (
        <div className="mt-1 rounded-md border bg-white p-2 text-sm shadow-lg">
          {/* Tile layer radio buttons */}
          {tileLayerNames.length > 0 && (
            <div className="mb-2 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Base layer</p>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="tile-layer"
                  checked={activeTileLayer === undefined}
                  onChange={() => setActiveTileLayer(undefined)}
                />
                <span>Default</span>
              </label>
              {tileLayerNames.map((name) => (
                <label key={name} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="tile-layer"
                    checked={activeTileLayer === name}
                    onChange={() => setActiveTileLayer(name)}
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          )}
          {/* Overlay group checkboxes */}
          {groupNames.length > 0 && (
            <div className="space-y-1">
              {tileLayerNames.length > 0 && (
                <p className="text-xs font-semibold text-muted-foreground">Overlays</p>
              )}
              {groupNames.map((name) => (
                <label key={name} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeGroups.has(name)}
                    onChange={() => toggleGroup(name)}
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── LayerGroup ─────────────────────────────────────────────── */

interface MapLayerGroupProps {
  name: string;
  children?: ReactNode;
}

function MapLayerGroup({ name, children }: MapLayerGroupProps) {
  const ctx = useContext(LayersContext);

  // Register this group name on mount
  useEffect(() => {
    ctx?.registerGroup(name);
  }, [ctx, name]);

  if (!ctx || !ctx.activeGroups.has(name)) return null;

  return <LayerGroup>{children}</LayerGroup>;
}

/* ── Named TileLayer registration ───────────────────────────── */

// Wrap MapTileLayer to auto-register named layers
const OriginalMapTileLayer = MapTileLayer;

function MapTileLayerWithRegistration({ name, ...props }: MapTileLayerProps) {
  const ctx = useContext(LayersContext);

  useEffect(() => {
    if (ctx && name) {
      ctx.registerTileLayer(name);
    }
  }, [ctx, name]);

  return <OriginalMapTileLayer name={name} {...props} />;
}

/* ── LocateControl ─────────────────────────────────────────── */

function MapLocateControl() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = useCallback(() => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 14 });

    function onFound() {
      setLocating(false);
      map.off("locationfound", onFound);
      map.off("locationerror", onError);
    }
    function onError() {
      setLocating(false);
      map.off("locationfound", onFound);
      map.off("locationerror", onError);
    }

    map.on("locationfound", onFound);
    map.on("locationerror", onError);
  }, [map]);

  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: 80, marginLeft: 10 }}>
      <div className="leaflet-control leaflet-bar">
        <a
          href="#"
          role="button"
          title="Find my location"
          aria-label="Find my location"
          onClick={(e) => {
            e.preventDefault();
            handleLocate();
          }}
          style={{ width: 30, height: 30, lineHeight: "30px", textAlign: "center", fontSize: 16 }}
        >
          {locating ? "…" : "◎"}
        </a>
      </div>
    </div>
  );
}

/* ── SearchControl ─────────────────────────────────────────── */

function MapSearchControl() {
  const map = useMap();
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, []);

  const search = useCallback((q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`)
      .then((r) => r.json())
      .then((data) => setResults(data))
      .catch(() => setResults([]));
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      setOpen(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(value), 400);
    },
    [search],
  );

  const handleSelect = useCallback(
    (result: { lat: string; lon: string }) => {
      map.flyTo([parseFloat(result.lat), parseFloat(result.lon)], 14);
      setOpen(false);
      setQuery("");
      setResults([]);
    },
    [map],
  );

  return (
    <div ref={ref} className="leaflet-top leaflet-left" style={{ marginTop: 10, marginLeft: 10 }}>
      <div className="leaflet-control rounded-md border bg-white shadow-lg">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search location…"
          className="w-48 rounded-md border-none bg-transparent px-2 py-1.5 text-sm outline-none"
        />
        {open && results.length > 0 && (
          <ul className="max-h-48 overflow-auto border-t text-sm">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  className="w-full px-2 py-1.5 text-left hover:bg-muted"
                  onClick={() => handleSelect(r)}
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ── Exports ────────────────────────────────────────────────── */

export {
  Map,
  MapTileLayerWithRegistration as MapTileLayer,
  MapMarker,
  MapCircleMarker,
  MapPopup,
  MapZoomControl,
  MapFullscreenControl,
  MapLocateControl,
  MapSearchControl,
  MapControlContainer,
  MapLayers,
  MapLayersControl,
  MapLayerGroup,
  useMap,
};
