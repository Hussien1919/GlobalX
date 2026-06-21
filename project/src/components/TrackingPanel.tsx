import { motion } from 'framer-motion';
import { Crosshair, Plane, Ship, Wifi, Cloud, Activity, MapPin, Gauge } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TrackingItem {
  id: string;
  type: 'aircraft' | 'maritime' | 'cyber' | 'weather';
  label: string;
  status: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
}

const trackingData: TrackingItem[] = [
  { id: 'ac-001', type: 'aircraft', label: 'NATO AWACS E-3A', status: 'patrol', lat: 50.5, lng: 15.5, speed: 450, heading: 270 },
  { id: 'ac-002', type: 'aircraft', label: 'USAF RC-135W', status: 'surveillance', lat: 54.0, lng: 20.0, speed: 380, heading: 180 },
  { id: 'ac-003', type: 'aircraft', label: 'RAF Sentinel R1', status: 'active', lat: 51.5, lng: -1.0, speed: 320, heading: 90 },
  { id: 'ac-004', type: 'aircraft', label: 'PLAAF KJ-500', status: 'patrol', lat: 25.0, lng: 120.0, speed: 400, heading: 45 },
  { id: 'mv-001', type: 'maritime', label: 'USS Dwight D. Eisenhower', status: 'deployment', lat: 35.5, lng: 25.0, speed: 28 },
  { id: 'mv-002', type: 'maritime', label: 'HMS Queen Elizabeth', status: 'exercise', lat: 58.0, lng: -5.0, speed: 22 },
  { id: 'mv-003', type: 'maritime', label: 'Liaoning CV-16', status: 'transit', lat: 18.0, lng: 112.0, speed: 18 },
  { id: 'mv-004', type: 'maritime', label: 'INS Vikrant', status: 'patrol', lat: 12.0, lng: 75.0, speed: 24 },
  { id: 'cy-001', type: 'cyber', label: 'APT28 Activity Cluster', status: 'active', lat: 55.75, lng: 37.6 },
  { id: 'cy-002', type: 'cyber', label: 'Lazarus Group Node', status: 'monitoring', lat: 39.0, lng: 125.5 },
  { id: 'cy-003', type: 'cyber', label: 'APT41 Infrastructure', status: 'active', lat: 31.2, lng: 121.5 },
  { id: 'wt-001', type: 'weather', label: 'Cyclone Mocha', status: 'cat-5', lat: 22.0, lng: 90.0, speed: 260 },
  { id: 'wt-002', type: 'weather', label: 'Storm System Alpha', status: 'severe', lat: 35.0, lng: -40.0, speed: 85 },
  { id: 'wt-003', type: 'weather', label: 'Heatwave Dome', status: 'extreme', lat: 33.0, lng: -112.0 },
];

const typeIcons = {
  aircraft: Plane,
  maritime: Ship,
  cyber: Wifi,
  weather: Cloud,
};

const typeColors = {
  aircraft: 'var(--gx-cyan)',
  maritime: 'var(--gx-blue)',
  cyber: 'var(--gx-yellow)',
  weather: 'var(--gx-orange)',
};

export default function TrackingPanel() {
  const [activeType, setActiveType] = useState<'all' | 'aircraft' | 'maritime' | 'cyber' | 'weather'>('all');
  const [positions, setPositions] = useState(trackingData);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map(item => ({
        ...item,
        lat: item.lat + (Math.random() - 0.5) * 0.1,
        lng: item.lng + (Math.random() - 0.5) * 0.1,
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = positions.filter(item => activeType === 'all' || item.type === activeType);

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.2)' }}>
            <Crosshair className="w-5 h-5" style={{ color: 'var(--gx-green)' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--gx-text-primary)' }}>Live Tracking</h1>
            <p className="text-[10px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>{filtered.length} active tracks</p>
          </div>
        </div>

        {/* Type filters */}
        <div className="flex gap-1.5 mb-5 flex-wrap">
          {(['all', 'aircraft', 'maritime', 'cyber', 'weather'] as const).map(type => (
            <button key={type} onClick={() => setActiveType(type)}
              className="px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold tracking-wider transition-all duration-200"
              style={{
                background: activeType === type ? `${type === 'all' ? 'var(--gx-cyan)' : typeColors[type]}10` : 'transparent',
                border: `1px solid ${activeType === type ? (type === 'all' ? 'rgba(0,229,255,0.2)' : 'var(--gx-border-active)') : 'var(--gx-border)'}`,
                color: activeType === type ? (type === 'all' ? 'var(--gx-cyan)' : typeColors[type]) : 'var(--gx-text-muted)',
              }}>
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="space-y-2 flex-1">
        {filtered.map((item, i) => {
          const Icon = typeIcons[item.type];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${typeColors[item.type]}08` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: typeColors[item.type] }} />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: 'var(--gx-text-primary)' }}>
                    {item.label}
                  </span>
                </div>
                <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded animate-blink"
                  style={{ background: `${typeColors[item.type]}12`, color: typeColors[item.type], border: `1px solid ${typeColors[item.type]}20` }}>
                  {item.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
                <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{item.lat.toFixed(2)}N, {item.lng.toFixed(2)}E</span>
                {item.speed && <span className="flex items-center gap-1"><Gauge className="w-2.5 h-2.5" />{item.speed} kts</span>}
                {item.heading !== undefined && <span>HDG {item.heading}</span>}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <Activity className="w-2.5 h-2.5 animate-blink" style={{ color: typeColors[item.type] }} />
                <span className="text-[7px] font-mono font-bold tracking-wider" style={{ color: typeColors[item.type] }}>
                  TRACKING
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
