import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { globalEvents, countryIntel } from '../data/globalEvents';
import { GlobalEvent, CountryIntel, Severity } from '../types';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const severityHex: Record<Severity, string> = {
  critical: '#ff1744',
  high: '#ff9100',
  medium: '#ffd600',
  low: '#00e676',
};

const categoryHex: Record<string, string> = {
  conflict: '#ff1744',
  cyber: '#00e5ff',
  economic: '#ffd600',
  disaster: '#ff9100',
  political: '#2196f3',
  transport: '#00e676',
};

const categoryColors: Record<string, string> = {
  conflict: 'var(--gx-red)',
  cyber: 'var(--gx-cyan)',
  economic: 'var(--gx-yellow)',
  disaster: 'var(--gx-orange)',
  political: 'var(--gx-blue)',
  transport: 'var(--gx-green)',
};

const severityColors: Record<Severity, string> = {
  critical: 'var(--gx-red)',
  high: 'var(--gx-orange)',
  medium: 'var(--gx-yellow)',
  low: 'var(--gx-green)',
};

const categoryIcons: Record<string, string> = {
  conflict: 'CF',
  cyber: 'CY',
  economic: 'EC',
  disaster: 'DS',
  political: 'PL',
  transport: 'TR',
};

const transportRoutes = [
  { id: 'air-1', type: 'aircraft' as const, label: 'NATO AWACS E-3A', from: [50.5, 15.5], to: [48.0, 37.8], color: '#00e5ff' },
  { id: 'air-2', type: 'aircraft' as const, label: 'USAF RC-135W', from: [54.0, 20.0], to: [50.85, 4.35], color: '#00e5ff' },
  { id: 'air-3', type: 'aircraft' as const, label: 'PLAAF KJ-500', from: [25.0, 120.0], to: [10.0, 114.0], color: '#2196f3' },
  { id: 'ship-1', type: 'maritime' as const, label: 'USS Eisenhower CSG', from: [35.5, 25.0], to: [22.0, 90.0], color: '#1565c0' },
  { id: 'ship-2', type: 'maritime' as const, label: 'Liaoning CV-16', from: [18.0, 112.0], to: [10.0, 114.0], color: '#1565c0' },
  { id: 'ship-3', type: 'maritime' as const, label: 'HMS Queen Elizabeth', from: [58.0, -5.0], to: [35.5, 25.0], color: '#1565c0' },
  { id: 'cyber-1', type: 'cyber' as const, label: 'APT28 -> EU Grid', from: [55.75, 37.6], to: [50.85, 4.35], color: '#ffd600' },
  { id: 'cyber-2', type: 'cyber' as const, label: 'Lazarus -> Crypto', from: [39.0, 125.5], to: [1.35, 103.8], color: '#ffd600' },
  { id: 'cyber-3', type: 'cyber' as const, label: 'APT41 -> US Water', from: [31.2, 121.5], to: [38.9, -77.0], color: '#ffd600' },
];

function createEventIcon(severity: Severity, isHovered: boolean) {
  const color = severityHex[severity];
  const size = isHovered ? 32 : 24;
  const inner = isHovered ? 16 : 14;
  const glow = isHovered ? `0 0 12px ${color}` : `0 0 6px ${color}`;

  return L.divIcon({
    className: `event-marker marker-${severity}`,
    html: `
      <div class="event-marker-inner" style="background:${color};box-shadow:${glow};width:${inner}px;height:${inner}px;border-radius:50%;position:relative">
        <div class="event-marker-ring" style="border-color:${color}"></div>
        <div class="event-marker-ring-2" style="border-color:${color}"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function MapController({ onRegionClick, onHoverCountry }: {
  onRegionClick: (intel: CountryIntel) => void;
  onHoverCountry: (intel: CountryIntel | null) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      let closest: CountryIntel | null = null;
      let minDist = Infinity;
      Object.values(countryIntel).forEach(c => {
        const d = Math.sqrt((c.lat - lat) ** 2 + (c.lng - lng) ** 2);
        if (d < minDist && d < 15) {
          minDist = d;
          closest = c;
        }
      });
      if (closest) onRegionClick(closest);
    },
    mousemove(e) {
      const { lat, lng } = e.latlng;
      let closest: CountryIntel | null = null;
      let minDist = Infinity;
      Object.values(countryIntel).forEach(c => {
        const d = Math.sqrt((c.lat - lat) ** 2 + (c.lng - lng) ** 2);
        if (d < minDist && d < 12) {
          minDist = d;
          closest = c;
        }
      });
      onHoverCountry(closest);
    },
  });
  return null;
}

function FlyToCountry({ code }: { code: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (code && countryIntel[code]) {
      const c = countryIntel[code];
      map.flyTo([c.lat, c.lng], 5, { duration: 1.5 });
    }
  }, [code, map]);
  return null;
}

// Auto-tour system
function AutoTour({ active, onEventFocus }: { active: boolean; onEventFocus: (event: GlobalEvent) => void }) {
  const map = useMap();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const criticalEvents = globalEvents.filter(e => e.severity === 'critical' || e.severity === 'high');
    let idx = 0;

    const tour = () => {
      if (criticalEvents.length === 0) return;
      const event = criticalEvents[idx % criticalEvents.length];
      map.flyTo([event.lat, event.lng], 5, { duration: 2 });
      onEventFocus(event);
      idx++;
    };

    tour();
    intervalRef.current = setInterval(tour, 8000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, map, onEventFocus]);

  return null;
}

// Native Leaflet overlay layers - no extra canvas, no requestAnimationFrame
// These render on Leaflet's own SVG/Canvas pane, avoiding compositing conflicts
function TransportLayer({ showTransport }: { showTransport: boolean }) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!showTransport) {
      if (layerRef.current) {
        layerRef.current.clearLayers();
      }
      return;
    }

    const group = L.layerGroup();
    transportRoutes.forEach(route => {
      L.polyline([route.from as L.LatLngTuple, route.to as L.LatLngTuple], {
        color: route.color,
        weight: 1.5,
        opacity: 0.08,
        dashArray: '4 8',
      }).addTo(group);

      L.circleMarker(route.from as L.LatLngTuple, {
        radius: 2,
        fillColor: route.color,
        fillOpacity: 0.6,
        stroke: false,
      }).addTo(group);

      L.circleMarker(route.to as L.LatLngTuple, {
        radius: 2,
        fillColor: route.color,
        fillOpacity: 0.6,
        stroke: false,
      }).addTo(group);
    });

    group.addTo(map);
    layerRef.current = group;

    return () => {
      group.remove();
    };
  }, [map, showTransport]);

  return null;
}

function HeatmapLayer({ showHeatmap }: { showHeatmap: boolean }) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!showHeatmap) {
      if (layerRef.current) {
        layerRef.current.clearLayers();
      }
      return;
    }

    const group = L.layerGroup();
    globalEvents.forEach(event => {
      const baseRadius = event.severity === 'critical' ? 50000 : event.severity === 'high' ? 35000 : 20000;
      L.circle([event.lat, event.lng], {
        radius: baseRadius,
        fillColor: severityHex[event.severity],
        fillOpacity: 0.04,
        stroke: false,
      }).addTo(group);
    });

    group.addTo(map);
    layerRef.current = group;

    return () => {
      group.remove();
    };
  }, [map, showHeatmap]);

  return null;
}

function CyberLayer({ showCyber }: { showCyber: boolean }) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!showCyber) {
      if (layerRef.current) {
        layerRef.current.clearLayers();
      }
      return;
    }

    const cyberEvents = globalEvents.filter(e => e.type === 'cyber');
    const group = L.layerGroup();
    cyberEvents.forEach(event => {
      L.circle([event.lat, event.lng], {
        radius: 30000,
        fillColor: categoryHex.cyber,
        fillOpacity: 0.03,
        color: categoryHex.cyber,
        weight: 1,
        opacity: 0.08,
      }).addTo(group);

      L.circle([event.lat, event.lng], {
        radius: 60000,
        fillColor: categoryHex.cyber,
        fillOpacity: 0.01,
        color: categoryHex.cyber,
        weight: 0.5,
        opacity: 0.04,
        dashArray: '4 6',
      }).addTo(group);
    });

    group.addTo(map);
    layerRef.current = group;

    return () => {
      group.remove();
    };
  }, [map, showCyber]);

  return null;
}

interface GlobalMapProps {
  onEventSelect: (event: GlobalEvent) => void;
  onCountrySelect: (intel: CountryIntel) => void;
  flyToCode?: string | null;
}

export default function GlobalMap({ onEventSelect, onCountrySelect, flyToCode }: GlobalMapProps) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['conflict', 'cyber', 'economic', 'disaster', 'political']));
  const [mapReady, setMapReady] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<CountryIntel | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showTransport, setShowTransport] = useState(true);
  const [showCyber, setShowCyber] = useState(true);
  const [autoTour, setAutoTour] = useState(false);
  const [timelineHours, setTimelineHours] = useState(24);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMapReady(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    const cutoff = new Date(Date.now() - timelineHours * 3600000);
    return globalEvents.filter(e => activeFilters.has(e.type) && e.timestamp >= cutoff);
  }, [activeFilters, timelineHours]);

  const toggleFilter = useCallback((cat: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const formatTimestamp = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const criticalCount = filteredEvents.filter(e => e.severity === 'critical').length;
  const highCount = filteredEvents.filter(e => e.severity === 'high').length;

  const handleEventFocus = useCallback((event: GlobalEvent) => {
    onEventSelect(event);
  }, [onEventSelect]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
      {mapReady && (
        <MapContainer
          center={[25, 10]}
          zoom={3}
          className="w-full h-full"
          zoomControl={false}
          style={{ background: 'var(--gx-bg-primary)', width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapController onRegionClick={onCountrySelect} onHoverCountry={setHoveredCountry} />
          {flyToCode && <FlyToCountry code={flyToCode} />}
          <AutoTour active={autoTour} onEventFocus={handleEventFocus} />

          {/* Native Leaflet overlay layers - no extra compositing */}
          <HeatmapLayer showHeatmap={showHeatmap} />
          <TransportLayer showTransport={showTransport} />
          <CyberLayer showCyber={showCyber} />

          {filteredEvents.map((event) => (
            <Marker
              key={event.id}
              position={[event.lat, event.lng]}
              icon={createEventIcon(event.severity, hoveredEvent === event.id)}
              eventHandlers={{
                click: () => onEventSelect(event),
                mouseover: () => setHoveredEvent(event.id),
                mouseout: () => setHoveredEvent(null),
              }}
            >
              <Popup>
                <div className="min-w-[240px] p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${categoryHex[event.type]}18`, color: categoryColors[event.type] }}>
                      {categoryIcons[event.type]} {event.type.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${severityHex[event.severity]}18`, color: severityColors[event.severity] }}>
                      {event.severity.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold mb-1" style={{ color: 'var(--gx-text-primary)' }}>
                    {event.title}
                  </h3>
                  <p className="text-[10px] mb-2 leading-relaxed" style={{ color: 'var(--gx-text-secondary)' }}>
                    {event.description.substring(0, 140)}...
                  </p>
                  <div className="flex items-center justify-between text-[9px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
                    <span>{event.country}</span>
                    <span>{formatTimestamp(event.timestamp)}</span>
                  </div>
                  {event.casualties && (
                    <div className="mt-1.5 text-[9px] font-mono" style={{ color: 'var(--gx-red)' }}>
                      Casualties: {event.casualties}
                    </div>
                  )}
                  {event.sources && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {event.sources.map(s => (
                        <span key={s} className="text-[7px] font-mono px-1 py-0.5 rounded"
                          style={{ background: 'rgba(0,229,255,0.05)', color: 'var(--gx-cyan-dim)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {/* Radar sweep overlay */}
      <div className="radar-overlay" style={{ opacity: 0.3 }}>
        <div className="radar-sweep-line" />
        <div className="radar-ring" style={{ inset: '10%', border: '1px solid rgba(0,229,255,0.03)' }} />
        <div className="radar-ring" style={{ inset: '30%', border: '1px solid rgba(0,229,255,0.04)' }} />
        <div className="radar-ring" style={{ inset: '55%', border: '1px solid rgba(0,229,255,0.03)' }} />
      </div>

      {/* Top-left: Overlay filters */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-3">
        <div className="glass rounded-xl p-4" style={{ minWidth: '150px' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-cyan)' }}>
              OVERLAY FILTERS
            </span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--gx-cyan)' }}>
              {filteredEvents.length}
            </span>
          </div>
          {['conflict', 'cyber', 'economic', 'disaster', 'political'].map(cat => (
            <button
              key={cat}
              onClick={() => toggleFilter(cat)}
              className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-[10px] font-mono transition-all duration-200"
              style={{
                background: activeFilters.has(cat) ? `${categoryHex[cat]}10` : 'transparent',
                color: activeFilters.has(cat) ? categoryColors[cat] : 'var(--gx-text-muted)',
                border: `1px solid ${activeFilters.has(cat) ? `${categoryHex[cat]}25` : 'transparent'}`,
              }}
            >
              <span className="w-2 h-2 rounded-full transition-all duration-200"
                style={{ background: activeFilters.has(cat) ? categoryHex[cat] : 'var(--gx-text-muted)', boxShadow: activeFilters.has(cat) ? `0 0 6px ${categoryHex[cat]}40` : 'none' }} />
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Layer toggles */}
        <div className="glass rounded-xl p-4" style={{ minWidth: '150px' }}>
          <div className="text-[9px] font-mono font-bold tracking-wider mb-3" style={{ color: 'var(--gx-cyan)' }}>
            LAYERS
          </div>
          {[
            { key: 'heatmap', label: 'HEATMAP', active: showHeatmap, toggle: () => setShowHeatmap(!showHeatmap) },
            { key: 'transport', label: 'TRANSPORT', active: showTransport, toggle: () => setShowTransport(!showTransport) },
            { key: 'cyber', label: 'CYBER FX', active: showCyber, toggle: () => setShowCyber(!showCyber) },
            { key: 'tour', label: 'AUTO TOUR', active: autoTour, toggle: () => setAutoTour(!autoTour) },
          ].map(layer => (
            <button
              key={layer.key}
              onClick={layer.toggle}
              className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-[10px] font-mono transition-all duration-200"
              style={{
                background: layer.active ? 'rgba(0,229,255,0.08)' : 'transparent',
                color: layer.active ? 'var(--gx-cyan)' : 'var(--gx-text-muted)',
                border: `1px solid ${layer.active ? 'rgba(0,229,255,0.15)' : 'transparent'}`,
              }}
            >
              <span className="w-2 h-2 rounded-full transition-all duration-200"
                style={{ background: layer.active ? 'var(--gx-cyan)' : 'var(--gx-text-muted)', boxShadow: layer.active ? '0 0 6px rgba(0,229,255,0.4)' : 'none' }} />
              {layer.label}
              {layer.key === 'tour' && layer.active && (
                <span className="ml-auto text-[7px] animate-blink" style={{ color: 'var(--gx-cyan)' }}>LIVE</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom-left: Event count + timeline */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-3">
        <div className="glass rounded-xl px-5 py-4">
          <div className="text-[8px] font-mono tracking-widest" style={{ color: 'var(--gx-text-muted)' }}>
            TRACKING
          </div>
          <div className="text-2xl font-bold font-mono leading-tight" style={{ color: 'var(--gx-cyan)' }}>
            {filteredEvents.length}
          </div>
          <div className="text-[8px] font-mono tracking-widest" style={{ color: 'var(--gx-text-muted)' }}>
            ACTIVE EVENTS
          </div>
          <div className="flex items-center gap-3 mt-2">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-breaking" style={{ background: 'var(--gx-red)' }} />
                <span className="text-[8px] font-mono font-bold" style={{ color: 'var(--gx-red)' }}>
                  {criticalCount} CRIT
                </span>
              </div>
            )}
            {highCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gx-orange)' }} />
                <span className="text-[8px] font-mono font-bold" style={{ color: 'var(--gx-orange)' }}>
                  {highCount} HIGH
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Timeline slider */}
        <div className="glass rounded-xl px-4 py-3" style={{ minWidth: '200px' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-mono tracking-wider" style={{ color: 'var(--gx-cyan)' }}>
              TIMELINE
            </span>
            <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--gx-cyan)' }}>
              {timelineHours}H
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="48"
            value={timelineHours}
            onChange={(e) => setTimelineHours(Number(e.target.value))}
            className="w-full"
            style={{
              background: `linear-gradient(to right, var(--gx-cyan) ${(timelineHours / 48) * 100}%, rgba(255,255,255,0.06) ${(timelineHours / 48) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[7px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>1H</span>
            <span className="text-[7px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>24H</span>
            <span className="text-[7px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>48H</span>
          </div>
        </div>
      </div>

      {/* Top-right: Hovered event tooltip */}
      <AnimatePresence>
        {hoveredEvent && (() => {
          const ev = filteredEvents.find(e => e.id === hoveredEvent);
          if (!ev) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-4 right-4 z-[1000] glass rounded-xl px-5 py-4 max-w-[240px]"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${categoryHex[ev.type]}15`, color: categoryColors[ev.type] }}>
                  {ev.type.toUpperCase()}
                </span>
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${severityHex[ev.severity]}15`, color: severityColors[ev.severity] }}>
                  {ev.severity.toUpperCase()}
                </span>
              </div>
              <div className="text-[11px] font-bold" style={{ color: 'var(--gx-text-primary)' }}>
                {ev.title}
              </div>
              <div className="text-[9px] font-mono mt-1" style={{ color: 'var(--gx-text-muted)' }}>
                {ev.country} - {formatTimestamp(ev.timestamp)}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Country hover preview card */}
      <AnimatePresence>
        {hoveredCountry && !hoveredEvent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-4 right-4 z-[1000] glass rounded-xl px-5 py-4 max-w-[260px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--gx-text-primary)' }}>
                {hoveredCountry.name}
              </span>
              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${severityHex[hoveredCountry.threatLevel]}12`, color: severityColors[hoveredCountry.threatLevel], border: `1px solid ${severityHex[hoveredCountry.threatLevel]}20` }}>
                {hoveredCountry.threatLevel.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <div className="text-[7px] font-mono tracking-wider" style={{ color: 'var(--gx-text-muted)' }}>STABILITY</div>
                <div className="text-sm font-bold font-mono" style={{ color: hoveredCountry.stability > 60 ? 'var(--gx-green)' : hoveredCountry.stability > 30 ? 'var(--gx-yellow)' : 'var(--gx-red)' }}>
                  {hoveredCountry.stability}%
                </div>
              </div>
              <div>
                <div className="text-[7px] font-mono tracking-wider" style={{ color: 'var(--gx-text-muted)' }}>CONFLICT</div>
                <div className="text-sm font-bold font-mono" style={{ color: hoveredCountry.conflictRisk > 70 ? 'var(--gx-red)' : hoveredCountry.conflictRisk > 40 ? 'var(--gx-orange)' : 'var(--gx-green)' }}>
                  {hoveredCountry.conflictRisk}%
                </div>
              </div>
            </div>
            <div className="text-[9px] leading-relaxed" style={{ color: 'var(--gx-text-secondary)' }}>
              {hoveredCountry.summary.substring(0, 100)}...
            </div>
            <div className="text-[8px] font-mono mt-2" style={{ color: 'var(--gx-cyan-dim)' }}>
              Click for full intelligence report
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom-right: Zoom controls */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <div className="glass rounded-lg overflow-hidden flex flex-col">
          <button className="px-3 py-2 text-sm font-mono hover-glow"
            style={{ color: 'var(--gx-cyan)', borderBottom: '1px solid var(--gx-border)' }}
            onClick={() => {
              const map = (document.querySelector('.leaflet-container') as any)?._leafletMap;
              map?.zoomIn();
            }}>+</button>
          <button className="px-3 py-2 text-sm font-mono hover-glow"
            style={{ color: 'var(--gx-cyan)' }}
            onClick={() => {
              const map = (document.querySelector('.leaflet-container') as any)?._leafletMap;
              map?.zoomOut();
            }}>-</button>
        </div>
      </div>

      {/* Top-center: Live indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="glass rounded-lg px-4 py-2 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full animate-blink" style={{ background: 'var(--gx-green)', boxShadow: '0 0 6px var(--gx-green)' }} />
          <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-green)' }}>
            LIVE INTELLIGENCE
          </span>
          {autoTour && (
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded animate-blink"
              style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--gx-cyan)', border: '1px solid rgba(0,229,255,0.15)' }}>
              AUTO TOUR
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
