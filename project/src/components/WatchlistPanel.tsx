import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Plus, X, Globe, Map, Zap, AlertTriangle } from 'lucide-react';
import { countryIntel } from '../data/globalEvents';
import { WatchlistType, CountryIntel, Severity } from '../types';
import { useState } from 'react';

interface WatchlistPanelProps {
  onCountrySelect: (intel: CountryIntel) => void;
}

const typeIcons: Record<WatchlistType, typeof Globe> = {
  country: Globe,
  region: Map,
  sector: Zap,
  event: AlertTriangle,
};

const severityColors: Record<Severity, string> = {
  critical: 'var(--gx-red)',
  high: 'var(--gx-orange)',
  medium: 'var(--gx-yellow)',
  low: 'var(--gx-green)',
};

const defaultWatchlist = [
  { type: 'country' as WatchlistType, name: 'Ukraine', code: 'UA' },
  { type: 'country' as WatchlistType, name: 'China', code: 'CN' },
  { type: 'country' as WatchlistType, name: 'United States', code: 'US' },
  { type: 'region' as WatchlistType, name: 'Eastern Europe', code: 'EU-EAST' },
  { type: 'sector' as WatchlistType, name: 'Energy Infrastructure', code: 'ENERGY' },
  { type: 'event' as WatchlistType, name: 'South China Sea', code: 'SCS' },
];

export default function WatchlistPanel({ onCountrySelect }: WatchlistPanelProps) {
  const [watchlist, setWatchlist] = useState(defaultWatchlist);
  const [showAdd, setShowAdd] = useState(false);

  const removeItem = (code: string) => {
    setWatchlist(prev => prev.filter(item => item.code !== code));
  };

  const addItem = (type: WatchlistType, name: string, code: string) => {
    if (watchlist.some(item => item.code === code)) return;
    setWatchlist(prev => [...prev, { type, name, code }]);
    setShowAdd(false);
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255, 145, 0, 0.08)', border: '1px solid rgba(255, 145, 0, 0.2)' }}>
              <Eye className="w-5 h-5" style={{ color: 'var(--gx-orange)' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--gx-text-primary)' }}>Watchlists</h1>
              <p className="text-[10px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>{watchlist.length} items tracked</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="p-2 rounded-lg transition-all hover-glow"
            style={{ border: '1px solid var(--gx-border)', background: showAdd ? 'rgba(0,229,255,0.08)' : 'transparent' }}>
            <Plus className="w-4 h-4" style={{ color: showAdd ? 'var(--gx-cyan)' : 'var(--gx-text-muted)' }} />
          </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="glass-card p-4 mb-5 overflow-hidden" style={{ maxHeight: '300px' }}>
              <div className="text-[9px] font-mono font-bold tracking-wider mb-3" style={{ color: 'var(--gx-cyan)' }}>
                ADD TO WATCHLIST
              </div>
              <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: '240px' }}>
                {Object.values(countryIntel).map(c => (
                  <button key={c.code} onClick={() => addItem('country', c.name, c.code)}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-[10px] transition-all hover-glow"
                    style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--gx-border)' }}>
                    <span style={{ color: 'var(--gx-text-secondary)' }}>{c.name}</span>
                    <Plus className="w-3 h-3" style={{ color: 'var(--gx-cyan-dim)' }} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="space-y-2 flex-1">
        {watchlist.map((item, i) => {
          const Icon = typeIcons[item.type];
          const intel = countryIntel[item.code];
          return (
            <motion.div
              key={item.code}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 cursor-pointer"
              onClick={() => intel && onCountrySelect(intel)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(0,229,255,0.04)' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: 'var(--gx-cyan-dim)' }} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold" style={{ color: 'var(--gx-text-primary)' }}>{item.name}</div>
                    <div className="text-[8px] font-mono tracking-wider" style={{ color: 'var(--gx-text-muted)' }}>{item.type.toUpperCase()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {intel && (
                    <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${severityColors[intel.threatLevel]}10`, color: severityColors[intel.threatLevel], border: `1px solid ${severityColors[intel.threatLevel]}20` }}>
                      {intel.threatLevel.toUpperCase()}
                    </span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); removeItem(item.code); }}
                    className="p-1 rounded transition-all hover-glow" style={{ border: '1px solid var(--gx-border)' }}>
                    <X className="w-3 h-3" style={{ color: 'var(--gx-text-muted)' }} />
                  </button>
                </div>
              </div>
              {intel && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[7px] font-mono tracking-wider mb-1" style={{ color: 'var(--gx-text-muted)' }}>STABILITY</div>
                    <div className="progress-bar">
                      <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${intel.stability}%` }} transition={{ duration: 0.6 }}
                        style={{ background: intel.stability > 60 ? 'var(--gx-green)' : intel.stability > 30 ? 'var(--gx-yellow)' : 'var(--gx-red)' }} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[7px] font-mono tracking-wider mb-1" style={{ color: 'var(--gx-text-muted)' }}>ECONOMY</div>
                    <div className="progress-bar">
                      <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${intel.economyScore}%` }} transition={{ duration: 0.6 }}
                        style={{ background: intel.economyScore > 60 ? 'var(--gx-green)' : intel.economyScore > 30 ? 'var(--gx-yellow)' : 'var(--gx-red)' }} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
