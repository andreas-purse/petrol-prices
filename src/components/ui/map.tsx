"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    PlaceAutocomplete,
    type PlaceAutocompleteProps,
} from "@/components/ui/place-autocomplete"
import type { CheckboxItem } from "@radix-ui/react-dropdown-menu"
import type {
    CircleMarker,
    DivIconOptions,
    ErrorEvent,
    LatLngExpression,
    LayerGroup,
    LocateOptions,
    LocationEvent,
    Map as LeafletMap,
    Marker,
    PointExpression,
    Popup,
    TileLayer,
    Tooltip,
} from "leaflet"
import "leaflet.fullscreen/dist/Control.FullScreen.css"
import "leaflet/dist/leaflet.css"
import {
    LayersIcon,
    LoaderCircleIcon,
    MapPinIcon,
    MaximizeIcon,
    MinimizeIcon,
    MinusIcon,
    NavigationIcon,
    PlusIcon,
} from "lucide-react"
import React, {
    Suspense,
    createContext,
    lazy,
    useContext,
    useEffect,
    useRef,
    useState,
    type ComponentType,
    type ReactNode,
    type Ref,
} from "react"
import { renderToString } from "react-dom/server"
import {
    useMap,
    useMapEvents,
    type CircleMarkerProps,
    type LayerGroupProps,
    type MapContainerProps,
    type MarkerProps,
    type PopupProps,
    type TileLayerProps,
    type TooltipProps,
} from "react-leaflet"

function createLazyComponent<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>
) {
    const LazyComponent = lazy(factory)

    return (props: React.ComponentProps<T>) => {
        const [isMounted, setIsMounted] = useState(false)

        useEffect(() => {
            setIsMounted(true)
        }, [])

        if (!isMounted) {
            return null
        }

        return (
            <Suspense>
                <LazyComponent {...props} />
            </Suspense>
        )
    }
}

const LeafletMapContainer = createLazyComponent(() =>
    import("react-leaflet").then((mod) => ({
        default: mod.MapContainer,
    }))
)
const LeafletTileLayer = createLazyComponent(() =>
    import("react-leaflet").then((mod) => ({
        default: mod.TileLayer,
    }))
)
const LeafletMarker = createLazyComponent(() =>
    import("react-leaflet").then((mod) => ({
        default: mod.Marker,
    }))
)
const LeafletPopup = createLazyComponent(() =>
    import("react-leaflet").then((mod) => ({
        default: mod.Popup,
    }))
)
const LeafletTooltip = createLazyComponent(() =>
    import("react-leaflet").then((mod) => ({
        default: mod.Tooltip,
    }))
)
const LeafletCircleMarker = createLazyComponent(() =>
    import("react-leaflet").then((mod) => ({
        default: mod.CircleMarker,
    }))
)
const LeafletLayerGroup = createLazyComponent(() =>
    import("react-leaflet").then((mod) => ({
        default: mod.LayerGroup,
    }))
)

function Map({
    zoom = 15,
    maxZoom = 18,
    className,
    ...props
}: Omit<MapContainerProps, "zoomControl"> & {
    center: LatLngExpression
    ref?: Ref<LeafletMap>
}) {
    return (
        <LeafletMapContainer
            zoom={zoom}
            maxZoom={maxZoom}
            attributionControl={false}
            zoomControl={false}
            className={cn(
                "z-50 size-full min-h-96 flex-1 rounded-md",
                className
            )}
            {...props}
        />
    )
}

interface MapTileLayerOption {
    name: string
    url: string
    attribution?: string
}

interface MapLayerGroupOption
    extends Pick<React.ComponentProps<typeof CheckboxItem>, "disabled"> {
    name: string
}

interface MapLayersContextType {
    registerTileLayer: (layer: MapTileLayerOption) => void
    tileLayers: MapTileLayerOption[]
    selectedTileLayer: string
    setSelectedTileLayer: (name: string) => void
    registerLayerGroup: (layer: MapLayerGroupOption) => void
    layerGroups: MapLayerGroupOption[]
    activeLayerGroups: string[]
    setActiveLayerGroups: (names: string[]) => void
}

const MapLayersContext = createContext<MapLayersContextType | null>(null)

function useMapLayersContext() {
    return useContext(MapLayersContext)
}

function MapTileLayer({
    name = "Default",
    url,
    attribution,
    darkUrl,
    darkAttribution,
    ...props
}: Partial<TileLayerProps> & {
    name?: string
    darkUrl?: string
    darkAttribution?: string
    ref?: Ref<TileLayer>
}) {
    const map = useMap()
    if (map.attributionControl) {
        map.attributionControl.setPrefix("")
    }

    const context = useContext(MapLayersContext)
    const DEFAULT_URL =
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
    const DEFAULT_DARK_URL =
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"

    const resolvedUrl = url ?? DEFAULT_URL
    const resolvedAttribution =
        attribution ??
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'

    useEffect(() => {
        if (context) {
            context.registerTileLayer({
                name,
                url: resolvedUrl,
                attribution: resolvedAttribution,
            })
        }
    }, [context, name, url, attribution])

    if (context && context.selectedTileLayer !== name) {
        return null
    }

    return (
        <LeafletTileLayer
            url={resolvedUrl}
            attribution={resolvedAttribution}
            {...props}
        />
    )
}

function MapLayerGroup({
    name,
    disabled,
    ...props
}: LayerGroupProps & MapLayerGroupOption & { ref?: Ref<LayerGroup> }) {
    const context = useMapLayersContext()

    useEffect(() => {
        if (context) {
            context.registerLayerGroup({
                name,
                disabled,
            })
        }
    }, [context, name, disabled])

    if (context && !context.activeLayerGroups.includes(name)) {
        return null
    }

    return <LeafletLayerGroup {...props} />
}

function MapLayers({
    defaultTileLayer,
    defaultLayerGroups = [],
    ...props
}: Omit<React.ComponentProps<typeof MapLayersContext.Provider>, "value"> & {
    defaultTileLayer?: string
    defaultLayerGroups?: string[]
}) {
    const [tileLayers, setTileLayers] = useState<MapTileLayerOption[]>([])
    const [selectedTileLayer, setSelectedTileLayer] = useState<string>(
        defaultTileLayer || ""
    )
    const [layerGroups, setLayerGroups] = useState<MapLayerGroupOption[]>([])
    const [activeLayerGroups, setActiveLayerGroups] =
        useState<string[]>(defaultLayerGroups)

    function registerTileLayer(tileLayer: MapTileLayerOption) {
        setTileLayers((prevTileLayers) => {
            if (prevTileLayers.some((layer) => layer.name === tileLayer.name)) {
                return prevTileLayers
            }
            return [...prevTileLayers, tileLayer]
        })
    }

    function registerLayerGroup(layerGroup: MapLayerGroupOption) {
        setLayerGroups((prevLayerGroups) => {
            if (
                prevLayerGroups.some((group) => group.name === layerGroup.name)
            ) {
                return prevLayerGroups
            }
            return [...prevLayerGroups, layerGroup]
        })
    }

    useEffect(() => {
        if (tileLayers.length > 0 && !selectedTileLayer) {
            const validDefaultValue =
                defaultTileLayer &&
                tileLayers.some((layer) => layer.name === defaultTileLayer)
                    ? defaultTileLayer
                    : tileLayers[0]!.name
            setSelectedTileLayer(validDefaultValue)
        }
    }, [
        tileLayers,
        defaultTileLayer,
        selectedTileLayer,
        layerGroups,
        defaultLayerGroups,
    ])

    return (
        <MapLayersContext.Provider
            value={{
                registerTileLayer,
                tileLayers,
                selectedTileLayer,
                setSelectedTileLayer,
                registerLayerGroup,
                layerGroups,
                activeLayerGroups,
                setActiveLayerGroups,
            }}
            {...props}
        />
    )
}

function MapLayersControl({
    tileLayersLabel = "Map Type",
    layerGroupsLabel = "Layers",
    position = "top-1 right-1",
    className,
    ...props
}: React.ComponentProps<"button"> & {
    tileLayersLabel?: string
    layerGroupsLabel?: string
    position?: string
}) {
    const layersContext = useMapLayersContext()
    if (!layersContext) {
        throw new Error("MapLayersControl must be used within MapLayers")
    }

    const {
        tileLayers,
        selectedTileLayer,
        setSelectedTileLayer,
        layerGroups,
        activeLayerGroups,
        setActiveLayerGroups,
    } = layersContext

    if (tileLayers.length === 0 && layerGroups.length === 0) {
        return null
    }

    function handleLayerGroupToggle(name: string, checked: boolean) {
        setActiveLayerGroups(
            checked
                ? [...activeLayerGroups, name]
                : activeLayerGroups.filter((groupName) => groupName !== name)
        )
    }

    const showTileLayersDropdown = tileLayers.length > 1
    const showLayerGroupsDropdown = layerGroups.length > 0

    if (!showTileLayersDropdown && !showLayerGroupsDropdown) {
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    aria-label="Select layers"
                    title="Select layers"
                    className={cn(
                        "absolute z-1000 border",
                        position,
                        className
                    )}
                    {...props}>
                    <LayersIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-1000">
                {showTileLayersDropdown && (
                    <>
                        <DropdownMenuLabel>{tileLayersLabel}</DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                            value={selectedTileLayer}
                            onValueChange={setSelectedTileLayer}>
                            {tileLayers.map((tileLayer) => (
                                <DropdownMenuRadioItem
                                    key={tileLayer.name}
                                    value={tileLayer.name}>
                                    {tileLayer.name}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </>
                )}
                {showTileLayersDropdown && showLayerGroupsDropdown && (
                    <DropdownMenuSeparator />
                )}
                {showLayerGroupsDropdown && (
                    <>
                        <DropdownMenuLabel>
                            {layerGroupsLabel}
                        </DropdownMenuLabel>
                        {layerGroups.map((layerGroup) => (
                            <DropdownMenuCheckboxItem
                                key={layerGroup.name}
                                checked={activeLayerGroups.includes(
                                    layerGroup.name
                                )}
                                disabled={layerGroup.disabled}
                                onCheckedChange={(checked) =>
                                    handleLayerGroupToggle(
                                        layerGroup.name,
                                        checked
                                    )
                                }>
                                {layerGroup.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function MapMarker({
    icon = <MapPinIcon className="size-6" />,
    iconAnchor = [12, 12],
    bgPos,
    popupAnchor,
    tooltipAnchor,
    ...props
}: Omit<MarkerProps, "icon"> &
    Pick<
        DivIconOptions,
        "iconAnchor" | "bgPos" | "popupAnchor" | "tooltipAnchor"
    > & {
        icon?: ReactNode
        ref?: Ref<Marker>
    }) {
    const { L } = useLeaflet()
    if (!L) return null

    return (
        <LeafletMarker
            icon={L.divIcon({
                html: renderToString(icon),
                iconAnchor,
                ...(bgPos ? { bgPos } : {}),
                ...(popupAnchor ? { popupAnchor } : {}),
                ...(tooltipAnchor ? { tooltipAnchor } : {}),
            })}
            riseOnHover
            {...props}
        />
    )
}

function MapCircleMarker({
    className,
    ...props
}: CircleMarkerProps & { ref?: Ref<CircleMarker> }) {
    return (
        <LeafletCircleMarker
            className={cn(
                "fill-foreground stroke-foreground stroke-2",
                className
            )}
            {...props}
        />
    )
}

function MapPopup({
    className,
    ...props
}: Omit<PopupProps, "content"> & { ref?: Ref<Popup> }) {
    return (
        <LeafletPopup
            className={cn(
                "bg-popover text-popover-foreground animate-in fade-out-0 fade-in-0 zoom-out-95 zoom-in-95 slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 font-sans shadow-md outline-hidden",
                className
            )}
            {...props}
        />
    )
}

function MapTooltip({
    className,
    children,
    side = "top",
    sideOffset = 15,
    ...props
}: Omit<TooltipProps, "offset"> & {
    side?: "top" | "right" | "bottom" | "left"
    sideOffset?: number
    ref?: Ref<Tooltip>
}) {
    const ARROW_POSITION_CLASSES = {
        top: "bottom-0.5 left-1/2 -translate-x-1/2 translate-y-1/2",
        bottom: "top-0.5 left-1/2 -translate-x-1/2 -translate-y-1/2",
        left: "right-0.5 top-1/2 translate-x-1/2 -translate-y-1/2",
        right: "left-0.5 top-1/2 -translate-x-1/2 -translate-y-1/2",
    }
    const DEFAULT_OFFSET = {
        top: [0, -sideOffset] satisfies PointExpression,
        bottom: [0, sideOffset] satisfies PointExpression,
        left: [-sideOffset, 0] satisfies PointExpression,
        right: [sideOffset, 0] satisfies PointExpression,
    }

    return (
        <LeafletTooltip
            className={cn(
                "animate-in fade-in-0 zoom-in-95 fade-out-0 zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 w-fit text-xs text-balance transition-opacity",
                className
            )}
            data-side={side}
            direction={side}
            offset={DEFAULT_OFFSET[side]}
            opacity={1}
            {...props}>
            {children}
            <div
                className={cn(
                    "bg-foreground fill-foreground absolute z-50 size-2.5 rotate-45 rounded-[2px]",
                    ARROW_POSITION_CLASSES[side]
                )}
            />
        </LeafletTooltip>
    )
}

function MapZoomControl({
    position = "top-1 left-1",
    className,
    ...props
}: React.ComponentProps<"div"> & { position?: string }) {
    const map = useMap()
    const [zoomLevel, setZoomLevel] = useState(map.getZoom())

    useMapEvents({
        zoomend: () => {
            setZoomLevel(map.getZoom())
        },
    })

    return (
        <MapControlContainer className={cn(position, className)}>
            <ButtonGroup
                orientation="vertical"
                aria-label="Zoom controls"
                {...props}>
                <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    aria-label="Zoom in"
                    title="Zoom in"
                    className="border"
                    disabled={zoomLevel >= map.getMaxZoom()}
                    onClick={() => map.zoomIn()}>
                    <PlusIcon />
                </Button>
                <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    aria-label="Zoom out"
                    title="Zoom out"
                    className="border"
                    disabled={zoomLevel <= map.getMinZoom()}
                    onClick={() => map.zoomOut()}>
                    <MinusIcon />
                </Button>
            </ButtonGroup>
        </MapControlContainer>
    )
}

function MapFullscreenControl({
    position = "top-1 right-1",
    className,
    ...props
}: React.ComponentProps<"button"> & { position?: string }) {
    const map = useMap()
    const [isFullscreen, setIsFullscreen] = useState(false)

    const { L } = useLeaflet()

    useEffect(() => {
        if (!L) return

        const fullscreenControl = new L.Control.FullScreen()
        fullscreenControl.addTo(map)

        const container = fullscreenControl.getContainer()
        if (container) {
            container.style.display = "none"
        }

        const handleEnter = () => setIsFullscreen(true)
        const handleExit = () => setIsFullscreen(false)

        map.on("enterFullscreen", handleEnter)
        map.on("exitFullscreen", handleExit)

        return () => {
            fullscreenControl.remove()
            map.off("enterFullscreen", handleEnter)
            map.off("exitFullscreen", handleExit)
        }
    }, [L, map])

    return (
        <MapControlContainer className={cn(position, className)}>
            <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                onClick={() => map.toggleFullscreen()}
                aria-label={
                    isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                className="border"
                {...props}>
                {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
            </Button>
        </MapControlContainer>
    )
}

function MapLocatePulseIcon() {
    return (
        <div className="absolute -top-1 -right-1 flex size-3 rounded-full">
            <div className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-75" />
            <div className="bg-primary relative inline-flex size-3 rounded-full" />
        </div>
    )
}

function MapLocateControl({
    watch = false,
    onLocationFound,
    onLocationError,
    position = "right-1 bottom-1",
    className,
    ...props
}: React.ComponentProps<"button"> &
    Pick<LocateOptions, "watch"> & {
        onLocationFound?: (location: LocationEvent) => void
        onLocationError?: (error: ErrorEvent) => void
    } & { position?: string }) {
    const map = useMap()
    const [isLocating, setIsLocating] = useDebounceLoadingState(200)
    const [location, setLocation] = useState<LatLngExpression | null>(null)

    function startLocating() {
        setIsLocating(true)
        map.locate({ setView: true, maxZoom: map.getMaxZoom(), watch })
        map.on("locationfound", (location: LocationEvent) => {
            setLocation(location.latlng)
            setIsLocating(false)
            onLocationFound?.(location)
        })
        map.on("locationerror", (error: ErrorEvent) => {
            setLocation(null)
            setIsLocating(false)
            onLocationError?.(error)
        })
    }

    function stopLocating() {
        map.stopLocate()
        map.off("locationfound")
        map.off("locationerror")
        setLocation(null)
        setIsLocating(false)
    }

    useEffect(() => () => stopLocating(), [])

    return (
        <MapControlContainer className={cn(position, className)}>
            <Button
                type="button"
                size="icon-sm"
                variant={location ? "default" : "secondary"}
                onClick={location ? stopLocating : startLocating}
                disabled={isLocating}
                title={
                    isLocating
                        ? "Locating..."
                        : location
                          ? "Stop tracking"
                          : "Track location"
                }
                aria-label={
                    isLocating
                        ? "Locating..."
                        : location
                          ? "Stop location tracking"
                          : "Start location tracking"
                }
                className="border"
                {...props}>
                {isLocating ? (
                    <LoaderCircleIcon className="animate-spin" />
                ) : (
                    <NavigationIcon />
                )}
            </Button>
            {location && (
                <MapMarker position={location} icon={<MapLocatePulseIcon />} />
            )}
        </MapControlContainer>
    )
}

function MapSearchControl({
    position = "top-1 left-1",
    className,
    ...props
}: PlaceAutocompleteProps & { position?: string }) {
    return (
        <MapControlContainer className={cn("z-1001 w-60", position, className)}>
            <PlaceAutocomplete {...props} />
        </MapControlContainer>
    )
}

function MapControlContainer({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const { L } = useLeaflet()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!L) return
        const element = containerRef.current
        if (!element) return
        L.DomEvent.disableClickPropagation(element)
        L.DomEvent.disableScrollPropagation(element)
    }, [L])

    return (
        <div
            ref={containerRef}
            className={cn("absolute z-1000 size-fit cursor-default", className)}
            {...props}
        />
    )
}

function useLeaflet() {
    const [L, setL] = useState<typeof import("leaflet") | null>(null)

    useEffect(() => {
        async function loadLeaflet() {
            const leaflet = await import("leaflet")
            const leafletFullscreen = await import("leaflet.fullscreen")

            const L_object = leaflet.default
            if (L_object.Control && !L_object.Control.FullScreen) {
                L_object.Control.FullScreen =
                    leafletFullscreen.default || leafletFullscreen
            }

            setL(L_object)
        }

        if (L) return
        if (typeof window === "undefined") return

        loadLeaflet()
    }, [L])

    return { L }
}

function useDebounceLoadingState(delay = 200) {
    const [isLoading, setIsLoading] = useState(false)
    const [showLoading, setShowLoading] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (isLoading) {
            timeoutRef.current = setTimeout(() => {
                setShowLoading(true)
            }, delay)
        } else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
            setShowLoading(false)
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [isLoading, delay])

    return [showLoading, setIsLoading] as const
}

export {
    Map,
    MapCircleMarker,
    MapControlContainer,
    MapFullscreenControl,
    MapLayerGroup,
    MapLayers,
    MapLayersControl,
    MapLocateControl,
    MapMarker,
    MapPopup,
    MapSearchControl,
    MapTileLayer,
    MapTooltip,
    MapZoomControl,
    useLeaflet,
    useMap,
}
