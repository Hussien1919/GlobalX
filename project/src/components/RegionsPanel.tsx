import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { countryIntel, regionSummaries, globalEvents } from '../data/globalEvents';
import { CountryIntel, Severity } from '../types';
import { useState } from 'react';

interface RegionsPanelProps {
  onCountrySelect: (intel: CountryIntel) => void;
}

const severityColors: Record<Severity, string> = {
  critical: 'var(--gx-red)',
  high: 'var(--gx-orange)',
  medium: 'var(--gx-yellow)',
  low: 'var(--gx-green)',
};

export default function RegionsPanel({ onCountrySelect }: RegionsPanelProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regions = Object.entries(regionSummaries).map(([name, summary]) => {
    const events = globalEvents.filter(e => e.region === name);
    const criticalCount = events.filter(e => e.severity === 'critical').length;
    const highCount = events.filter(e => e.severity === 'high').length;
    return { name, summary, events, criticalCount, highCount };
  }).sort((a, b) => (b.criticalCount + b.highCount) - (a.criticalCount + a.highCount));

  const countriesByRegion = (region: string) =>
    Object.values(countryIntel).filter(c =>
      globalEvents.some(e => e.countryCode === c.code && e.region === region)
    );

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(33, 150, 243, 0.08)', border: '1px solid rgba(33, 150, 243, 0.2)' }}>
            <Globe className="w-5 h-5" style={{ color: 'var(--gx-blue)' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--gx-text-primary)' }}>Regions</h1>
            <p className="text-[10px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>{regions.length} monitored regions</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-2 flex-1">
        {regions.map((region, i) => (
          <motion.div
            key={region.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <button
              onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
              className="w-full text-left p-4 rounded-xl transition-all hover-glow"
              style={{
                background: selectedRegion === region.name ? 'rgba(0, 229, 255, 0.04)' : 'rgba(255, 255, 255, 0.015)',
                border: `1px solid ${selectedRegion === region.name ? 'rgba(0,229,255,0.2)' : 'var(--gx-border)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {selectedRegion === region.name ? (
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--gx-cyan)' }} />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--gx-text-muted)' }} />
                  )}
                  <span className="text-[11px] font-bold" style={{ color: 'var(--gx-text-primary)' }}>
                    {region.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {region.criticalCount > 0 && (
                    <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255, 23, 68, 0.12)', color: 'var(--gx-red)', border: '1px solid rgba(255,23,68,0.15)' }}>
                      {region.criticalCount} CRIT
                    </span>
                  )}
                  {region.highCount > 0 && (
                    <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255, 145, 0, 0.12)', color: 'var(--gx-orange)', border: '1px solid rgba(255,145,0,0.15)' }}>
                      {region.highCount} HIGH
                    </span>
                  )}
                  <span className="text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
                    {region.events.length}
                  </span>
                </div>
              </div>
              <p className="text-[9px] leading-relaxed ml-6" style={{ color: 'var(--gx-text-muted)' }}>
                {region.summary.substring(0, 90)}...
              </p>
            </button>

            <AnimatePresence>
              {selectedRegion === region.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-6 mt-1.5 space-y-1.5 overflow-hidden"
                >
                  {countriesByRegion(region.name).map(country => (
                    <button
                      key={country.code}
                      onClick={() => onCountrySelect(country)}
                      className="w-full text-left flex items-center justify-between p-3 rounded-lg transition-all hover-glow"
                      style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--gx-border)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Activity className="w-3 h-3" style={{ color: severityColors[country.threatLevel] }} />
                        <span className="text-[10px] font-bold" style={{ color: 'var(--gx-text-primary)' }}>
                          {country.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 progress-bar">
                          <div className="progress-bar-fill" style={{
                            width: `${country.stability}%`,
                            background: country.stability > 60 ? 'var(--gx-green)' : 'var(--gx-red)',
                          }} />
                        </div>
                        <span className="text-[8px] font-mono font-bold" style={{ color: severityColors[country.threatLevel] }}>
                          {country.threatLevel.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
