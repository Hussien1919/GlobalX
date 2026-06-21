import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Brain, TrendingUp, TrendingDown, Minus,
  Volume2, VolumeX, Radio, Eye, Moon, Zap, Shield,
  Activity, Globe
} from 'lucide-react';
import { GlobalEvent, CountryIntel, AudioMode, Severity } from '../types';
import { regionSummaries, globalEvents } from '../data/globalEvents';
import { useState, useEffect } from 'react';

interface RightPanelProps {
  selectedEvent: GlobalEvent | null;
  selectedCountry: CountryIntel | null;
  audioMode: AudioMode;
  onAudioModeChange: (mode: AudioMode) => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (v: number) => void;
}

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

const audioModes: { id: AudioMode; label: string; icon: typeof Radio }[] = [
  { id: 'global_radio', label: 'Global Radio', icon: Radio },
  { id: 'focus', label: 'Focus', icon: Eye },
  { id: 'alert', label: 'Alert', icon: AlertTriangle },
  { id: 'night', label: 'Night', icon: Moon },
];

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const trendColors = {
  up: 'var(--gx-red)',
  down: 'var(--gx-green)',
  stable: 'var(--gx-text-muted)',
};

export default function RightPanel({
  selectedEvent, selectedCountry, audioMode, onAudioModeChange,
  isAudioPlaying, onToggleAudio, isMuted, onToggleMute, volume, onVolumeChange,
}: RightPanelProps) {
  const [threatSummary, setThreatSummary] = useState({ critical: 0, high: 0, medium: 0, low: 0 });
  const [activeSection, setActiveSection] = useState<'threat' | 'country' | 'event' | 'ai' | 'audio' | 'regions' | 'live'>('threat');

  useEffect(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    globalEvents.forEach(e => { counts[e.severity]++; });
    setThreatSummary(counts);
  }, []);

  useEffect(() => {
    if (selectedCountry) setActiveSection('country');
    else if (selectedEvent) setActiveSection('event');
  }, [selectedCountry, selectedEvent]);

  const formatTimestamp = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  const totalThreats = threatSummary.critical + threatSummary.high;

  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 xl:w-72 h-full glass flex flex-col z-40 shrink-0 overflow-hidden"
    >
      {/* Section tabs */}
      <div className="flex items-center gap-0.5 p-2 border-b" style={{ borderColor: 'var(--gx-border)' }}>
        {[
          { id: 'threat' as const, icon: Shield, label: 'THREAT' },
          { id: 'live' as const, icon: Activity, label: 'LIVE' },
          { id: 'ai' as const, icon: Brain, label: 'AI' },
          { id: 'audio' as const, icon: Volume2, label: 'AUDIO' },
          { id: 'regions' as const, icon: Globe, label: 'REGIONS' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id || (tab.id === 'threat' && (activeSection === 'country' || activeSection === 'event'));
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[8px] font-mono font-bold tracking-wider transition-all duration-200"
              style={{
                background: isActive ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                color: isActive ? 'var(--gx-cyan)' : 'var(--gx-text-muted)',
                border: `1px solid ${isActive ? 'rgba(0, 229, 255, 0.15)' : 'transparent'}`,
              }}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden xl:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Threat Level */}
          {(activeSection === 'threat' || activeSection === 'country' || activeSection === 'event') && (
            <motion.div
              key="threat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Global threat level */}
              <div className="p-3 border-b" style={{ borderColor: 'var(--gx-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: totalThreats > 5 ? 'var(--gx-red)' : 'var(--gx-cyan)' }} />
                    <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-cyan)' }}>
                      GLOBAL THREAT LEVEL
                    </span>
                  </div>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold"
                    style={{
                      background: totalThreats > 5 ? 'rgba(255,23,68,0.12)' : 'rgba(0,229,255,0.08)',
                      color: totalThreats > 5 ? 'var(--gx-red)' : 'var(--gx-cyan)',
                      border: `1px solid ${totalThreats > 5 ? 'rgba(255,23,68,0.2)' : 'rgba(0,229,255,0.15)'}`
                    }}>
                    {totalThreats > 5 ? 'ELEVATED' : 'MODERATE'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['critical', 'high', 'medium', 'low'] as Severity[]).map(sev => (
                    <div key={sev} className="text-center p-2 rounded-lg" style={{ background: `${severityHex[sev]}08` }}>
                      <div className="text-xl font-bold font-mono leading-none mb-1" style={{ color: severityColors[sev] }}>
                        {threatSummary[sev]}
                      </div>
                      <div className="text-[7px] font-mono uppercase tracking-wider" style={{ color: 'var(--gx-text-muted)' }}>
                        {sev}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 h-2 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {(['critical', 'high', 'medium', 'low'] as Severity[]).map(sev => (
                    <motion.div
                      key={sev}
                      className="h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(threatSummary[sev] / globalEvents.length) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{ background: severityColors[sev] }}
                    />
                  ))}
                </div>
              </div>

              {/* Selected Country Intel */}
              <AnimatePresence mode="wait">
                {selectedCountry && (
                  <motion.div
                    key={selectedCountry.code}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3 border-b" style={{ borderColor: 'var(--gx-border)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" style={{ color: 'var(--gx-cyan)' }} />
                        <span className="text-xs font-bold" style={{ color: 'var(--gx-text-primary)' }}>
                          {selectedCountry.name}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: `${severityColors[selectedCountry.threatLevel]}12`,
                          color: severityColors[selectedCountry.threatLevel],
                          border: `1px solid ${severityColors[selectedCountry.threatLevel]}25`
                        }}>
                        {selectedCountry.threatLevel.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed mb-3" style={{ color: 'var(--gx-text-secondary)' }}>
                      {selectedCountry.summary}
                    </p>
                    <div className="space-y-2.5">
                      {selectedCountry.indicators.map((ind, i) => {
                        const TrendIcon = trendIcons[ind.trend];
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[8px] font-mono tracking-wider" style={{ color: 'var(--gx-text-muted)' }}>
                                {ind.label}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--gx-text-primary)' }}>
                                  {ind.value}%
                                </span>
                                <TrendIcon className="w-3 h-3" style={{ color: trendColors[ind.trend] }} />
                              </div>
                            </div>
                            <div className="progress-bar">
                              <motion.div
                                className="progress-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${ind.value}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                style={{
                                  background: ind.value > 70 ? 'var(--gx-red)' : ind.value > 40 ? 'var(--gx-yellow)' : 'var(--gx-green)',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Event Detail */}
              <AnimatePresence mode="wait">
                {selectedEvent && !selectedCountry && (
                  <motion.div
                    key={selectedEvent.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3 border-b" style={{ borderColor: 'var(--gx-border)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: `${severityColors[selectedEvent.severity]}12`,
                          color: severityColors[selectedEvent.severity],
                          border: `1px solid ${severityColors[selectedEvent.severity]}20`
                        }}>
                        {selectedEvent.severity.toUpperCase()}
                      </span>
                      <span className="text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
                        {selectedEvent.type.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-[11px] font-bold mb-1.5" style={{ color: 'var(--gx-text-primary)' }}>
                      {selectedEvent.title}
                    </h3>
                    <p className="text-[10px] leading-relaxed mb-2" style={{ color: 'var(--gx-text-secondary)' }}>
                      {selectedEvent.description}
                    </p>
                    <div className="flex items-center justify-between text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
                      <span>{selectedEvent.country}</span>
                      <span>{formatTimestamp(selectedEvent.timestamp)}</span>
                    </div>
                    {selectedEvent.sources && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedEvent.sources.map(s => (
                          <span key={s} className="text-[7px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(0, 229, 255, 0.04)', color: 'var(--gx-cyan-dim)', border: '1px solid rgba(0,229,255,0.06)' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick activity feed */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-3.5 h-3.5" style={{ color: 'var(--gx-cyan)' }} />
                  <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-cyan)' }}>
                    RECENT ACTIVITY
                  </span>
                </div>
                <div className="space-y-1.5">
                  {globalEvents.slice(0, 5).map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all hover-glow"
                      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid transparent' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: severityColors[event.severity], boxShadow: `0 0 4px ${severityHex[event.severity]}40` }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-bold truncate" style={{ color: 'var(--gx-text-primary)' }}>
                          {event.title}
                        </div>
                        <div className="text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
                          {event.country} - {formatTimestamp(event.timestamp)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Live Intelligence Feed */}
          {activeSection === 'live' && (
            <motion.div
              key="live"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3"
            >
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 animate-blink" style={{ color: 'var(--gx-green)' }} />
                <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-green)' }}>
                  LIVE INTELLIGENCE
                </span>
              </div>

              {/* Breaking events */}
              <div className="mb-4">
                <div className="text-[8px] font-mono tracking-wider mb-2" style={{ color: 'var(--gx-red)' }}>
                  BREAKING
                </div>
                {globalEvents.filter(e => e.severity === 'critical').map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-2.5 rounded-lg mb-1.5"
                    style={{ background: 'rgba(255,23,68,0.04)', border: '1px solid rgba(255,23,68,0.12)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full animate-breaking" style={{ background: 'var(--gx-red)' }} />
                      <span className="text-[9px] font-bold" style={{ color: 'var(--gx-text-primary)' }}>
                        {event.title}
                      </span>
                    </div>
                    <div className="text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
                      {event.country} - {formatTimestamp(event.timestamp)}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Transport activity */}
              <div className="mb-4">
                <div className="text-[8px] font-mono tracking-wider mb-2" style={{ color: 'var(--gx-cyan)' }}>
                  TRANSPORT ACTIVITY
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(0,229,255,0.03)', border: '1px solid var(--gx-border)' }}>
                    <div className="text-lg font-bold font-mono" style={{ color: 'var(--gx-cyan)' }}>4</div>
                    <div className="text-[7px] font-mono tracking-wider" style={{ color: 'var(--gx-text-muted)' }}>AIRCRAFT</div>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(33,150,243,0.03)', border: '1px solid var(--gx-border)' }}>
                    <div className="text-lg font-bold font-mono" style={{ color: 'var(--gx-blue)' }}>3</div>
                    <div className="text-[7px] font-mono tracking-wider" style={{ color: 'var(--gx-text-muted)' }}>MARITIME</div>
                  </div>
                </div>
              </div>

              {/* Cyber indicators */}
              <div>
                <div className="text-[8px] font-mono tracking-wider mb-2" style={{ color: 'var(--gx-yellow)' }}>
                  CYBER ACTIVITY
                </div>
                <div className="space-y-1.5">
                  {globalEvents.filter(e => e.type === 'cyber').slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center gap-2 p-2 rounded-lg"
                      style={{ background: 'rgba(255,214,0,0.02)', border: '1px solid var(--gx-border)' }}>
                      <Zap className="w-3 h-3 shrink-0" style={{ color: 'var(--gx-yellow)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-bold truncate" style={{ color: 'var(--gx-text-primary)' }}>
                          {event.title}
                        </div>
                        <div className="text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
                          {event.country}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Insights */}
          {activeSection === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3"
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4" style={{ color: 'var(--gx-cyan)' }} />
                <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-cyan)' }}>
                  AI INSIGHTS
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  { text: 'Eastern European conflict trajectory suggests 73% escalation probability within 72 hours.', confidence: 73 },
                  { text: 'Cyber threat correlation: Energy sector attacks show coordinated APT signature.', confidence: 89 },
                  { text: 'Economic risk model: 3 emerging markets approaching critical debt thresholds.', confidence: 61 },
                  { text: 'Climate disaster pattern: Unusual cyclone intensity correlates with SST anomalies.', confidence: 55 },
                ].map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-2.5 rounded-lg"
                    style={{ background: 'rgba(0, 229, 255, 0.02)', border: '1px solid var(--gx-border)' }}
                  >
                    <div className="flex items-start gap-2">
                      <Zap className="w-3 h-3 mt-0.5 shrink-0" style={{ color: 'var(--gx-cyan-dim)' }} />
                      <div>
                        <p className="text-[10px] leading-relaxed mb-1.5" style={{ color: 'var(--gx-text-secondary)' }}>
                          {insight.text}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[7px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
                            CONFIDENCE
                          </span>
                          <div className="flex-1 progress-bar">
                            <div className="progress-bar-fill" style={{
                              width: `${insight.confidence}%`,
                              background: insight.confidence > 75 ? 'var(--gx-red)' : insight.confidence > 50 ? 'var(--gx-yellow)' : 'var(--gx-green)',
                            }} />
                          </div>
                          <span className="text-[8px] font-mono font-bold" style={{ color: 'var(--gx-text-primary)' }}>
                            {insight.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Audio Controls */}
          {activeSection === 'audio' && (
            <motion.div
              key="audio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" style={{ color: 'var(--gx-text-muted)' }} />
                  ) : (
                    <Volume2 className="w-4 h-4" style={{ color: 'var(--gx-cyan)' }} />
                  )}
                  <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-cyan)' }}>
                    AUDIO CENTER
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={onToggleMute} className="p-1.5 rounded-md transition-all hover-glow"
                    style={{ border: '1px solid var(--gx-border)' }}>
                    {isMuted ? (
                      <VolumeX className="w-3.5 h-3.5" style={{ color: 'var(--gx-text-muted)' }} />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" style={{ color: 'var(--gx-cyan)' }} />
                    )}
                  </button>
                  <button onClick={onToggleAudio} className="px-2.5 py-1 rounded-md text-[9px] font-mono font-bold transition-all hover-glow"
                    style={{
                      background: isAudioPlaying ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                      border: `1px solid ${isAudioPlaying ? 'rgba(0,229,255,0.3)' : 'var(--gx-border)'}`,
                      color: isAudioPlaying ? 'var(--gx-cyan)' : 'var(--gx-text-muted)',
                    }}>
                    {isAudioPlaying ? 'STOP' : 'START'}
                  </button>
                </div>
              </div>

              {/* Volume */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[8px] font-mono tracking-wider" style={{ color: 'var(--gx-text-muted)' }}>
                    VOLUME
                  </span>
                  <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--gx-cyan)' }}>
                    {isMuted ? 0 : volume}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, var(--gx-cyan) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.06) ${isMuted ? 0 : volume}%)`,
                  }}
                />
              </div>

              {/* Mode selector */}
              <div className="grid grid-cols-2 gap-1.5">
                {audioModes.map(mode => {
                  const Icon = mode.icon;
                  const isActive = audioMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => onAudioModeChange(mode.id)}
                      className="flex items-center gap-1.5 px-2 py-2 rounded-lg text-[9px] font-mono transition-all duration-200"
                      style={{
                        background: isActive ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                        border: `1px solid ${isActive ? 'rgba(0,229,255,0.2)' : 'var(--gx-border)'}`,
                        color: isActive ? 'var(--gx-cyan)' : 'var(--gx-text-muted)',
                        boxShadow: isActive ? '0 0 12px rgba(0,229,255,0.04)' : 'none',
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Trending Regions */}
          {activeSection === 'regions' && (
            <motion.div
              key="regions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3"
            >
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-3.5 h-3.5" style={{ color: 'var(--gx-orange)' }} />
                <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-orange)' }}>
                  TRENDING REGIONS
                </span>
              </div>
              <div className="space-y-1.5">
                {Object.entries(regionSummaries).slice(0, 8).map(([region, summary], i) => (
                  <motion.div
                    key={region}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-2.5 rounded-lg transition-all hover-glow"
                    style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--gx-border)' }}
                  >
                    <div className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--gx-text-primary)' }}>
                      {region}
                    </div>
                    <div className="text-[9px] leading-relaxed" style={{ color: 'var(--gx-text-muted)' }}>
                      {summary.substring(0, 90)}...
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
