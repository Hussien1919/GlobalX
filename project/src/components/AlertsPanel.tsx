import { motion } from 'framer-motion';
import { Bell, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { globalEvents } from '../data/globalEvents';
import { Severity, Category, GlobalEvent, CountryIntel } from '../types';
import { useState } from 'react';

const severityColors: Record<Severity, string> = {
  critical: 'var(--gx-red)',
  high: 'var(--gx-orange)',
  medium: 'var(--gx-yellow)',
  low: 'var(--gx-green)',
};

const severityHex: Record<Severity, string> = {
  critical: '#ff1744',
  high: '#ff9100',
  medium: '#ffd600',
  low: '#00e676',
};

const categoryColors: Record<Category, string> = {
  conflict: 'var(--gx-red)',
  cyber: 'var(--gx-cyan)',
  economic: 'var(--gx-yellow)',
  disaster: 'var(--gx-orange)',
  political: 'var(--gx-blue)',
};

interface AlertsPanelProps {
  onEventSelect: (event: GlobalEvent) => void;
  onCountrySelect?: (intel: CountryIntel) => void;
}

export default function AlertsPanel({ onEventSelect }: AlertsPanelProps) {
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');

  const filtered = globalEvents.filter(e => {
    if (filter !== 'all' && e.severity !== filter) return false;
    if (categoryFilter !== 'all' && e.type !== categoryFilter) return false;
    return true;
  });

  const criticalCount = filtered.filter(e => e.severity === 'critical').length;

  const formatTimestamp = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255, 23, 68, 0.08)', border: '1px solid rgba(255, 23, 68, 0.2)' }}>
              <Bell className="w-5 h-5" style={{ color: 'var(--gx-red)' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--gx-text-primary)' }}>Alerts & Events</h1>
              <p className="text-[10px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>{filtered.length} active alerts</p>
            </div>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg animate-breaking"
              style={{ background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.2)' }}>
              <AlertTriangle className="w-3 h-3" style={{ color: 'var(--gx-red)' }} />
              <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--gx-red)' }}>{criticalCount} CRITICAL</span>
            </div>
          )}
        </div>

        {/* Severity filters */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map(sev => (
            <button key={sev} onClick={() => setFilter(sev)}
              className="px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold tracking-wider transition-all duration-200"
              style={{
                background: filter === sev ? `${sev === 'all' ? 'var(--gx-cyan)' : severityColors[sev]}10` : 'transparent',
                border: `1px solid ${filter === sev ? (sev === 'all' ? 'rgba(0,229,255,0.2)' : `${severityHex[sev]}25`) : 'var(--gx-border)'}`,
                color: filter === sev ? (sev === 'all' ? 'var(--gx-cyan)' : severityColors[sev]) : 'var(--gx-text-muted)',
              }}>
              {sev.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 mb-5 flex-wrap">
          {(['all', 'conflict', 'cyber', 'economic', 'disaster', 'political'] as const).map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className="px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold tracking-wider transition-all duration-200"
              style={{
                background: categoryFilter === cat ? `${cat === 'all' ? 'var(--gx-cyan)' : categoryColors[cat]}10` : 'transparent',
                border: `1px solid ${categoryFilter === cat ? (cat === 'all' ? 'rgba(0,229,255,0.2)' : 'var(--gx-border-active)') : 'var(--gx-border)'}`,
                color: categoryFilter === cat ? (cat === 'all' ? 'var(--gx-cyan)' : categoryColors[cat]) : 'var(--gx-text-muted)',
              }}>
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onEventSelect(event)}
            className="glass-card p-4 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${severityColors[event.severity]}12`, color: severityColors[event.severity], border: `1px solid ${severityHex[event.severity]}20` }}>
                {event.severity.toUpperCase()}
              </span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: `${categoryColors[event.type]}08`, color: categoryColors[event.type] }}>
                {event.type.toUpperCase()}
              </span>
              <span className="text-[8px] font-mono ml-auto flex items-center gap-1" style={{ color: 'var(--gx-text-muted)' }}>
                <Clock className="w-2.5 h-2.5" />
                {formatTimestamp(event.timestamp)}
              </span>
            </div>
            <h3 className="text-[11px] font-bold mb-1.5" style={{ color: 'var(--gx-text-primary)' }}>
              {event.title}
            </h3>
            <p className="text-[10px] leading-relaxed mb-2" style={{ color: 'var(--gx-text-secondary)' }}>
              {event.description.substring(0, 120)}...
            </p>
            <div className="flex items-center gap-2 text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
              <MapPin className="w-2.5 h-2.5" />
              <span>{event.country}</span>
              <span style={{ color: 'var(--gx-border)' }}>|</span>
              <span>{event.region}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
