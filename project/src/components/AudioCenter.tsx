import { motion } from 'framer-motion';
import {
  Volume2, VolumeX, Radio, Eye, AlertTriangle, Moon,
  Play, Pause, Headphones, Mic, Waves
} from 'lucide-react';
import { AudioMode } from '../types';
import { audioEngine } from '../audio/AudioEngine';
import { useState, useEffect } from 'react';

interface AudioCenterProps {
  audioMode: AudioMode;
  onAudioModeChange: (mode: AudioMode) => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (v: number) => void;
}

const audioModes: { id: AudioMode; label: string; description: string; icon: typeof Radio }[] = [
  { id: 'global_radio', label: 'Global Radio', description: 'Continuous AI world narration. Feels like a live intelligence broadcast.', icon: Radio },
  { id: 'focus', label: 'Focus Mode', description: 'Voice only discusses selected countries and regions of interest.', icon: Eye },
  { id: 'alert', label: 'Alert Mode', description: 'Voice interrupts only during important events and critical updates.', icon: AlertTriangle },
  { id: 'night', label: 'Night Mode', description: 'Calm ambient tactical audio with minimal interruptions.', icon: Moon },
];

export default function AudioCenter({
  audioMode, onAudioModeChange, isAudioPlaying, onToggleAudio,
  isMuted, onToggleMute, volume, onVolumeChange,
}: AudioCenterProps) {
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lastNarration, setLastNarration] = useState('');
  const [signalBars, setSignalBars] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    audioEngine.onNarrationUpdate((msg) => setLastNarration(msg));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSignalBars(Array.from({ length: 7 }, () => Math.random()));
    }, 180);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.2)', boxShadow: '0 0 20px rgba(0, 229, 255, 0.04)' }}>
            <Headphones className="w-5 h-5" style={{ color: 'var(--gx-cyan)' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--gx-text-primary)' }}>Audio Center</h1>
            <p className="text-[10px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>Immersive Intelligence Audio</p>
          </div>
        </div>

        {/* Main playback control */}
        <div className="glass-card p-5 mb-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={onToggleAudio}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: isAudioPlaying ? 'rgba(0, 229, 255, 0.12)' : 'rgba(0, 229, 255, 0.04)',
                  border: `2px solid ${isAudioPlaying ? 'rgba(0,229,255,0.3)' : 'var(--gx-border)'}`,
                  boxShadow: isAudioPlaying ? '0 0 30px rgba(0, 229, 255, 0.15)' : 'none',
                }}
                whileTap={{ scale: 0.95 }}
              >
                {isAudioPlaying ? (
                  <Pause className="w-6 h-6" style={{ color: 'var(--gx-cyan)' }} />
                ) : (
                  <Play className="w-6 h-6" style={{ color: 'var(--gx-cyan)' }} />
                )}
              </motion.button>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--gx-text-primary)' }}>
                  {isAudioPlaying ? 'LIVE BROADCAST' : 'PAUSED'}
                </div>
                <div className="text-[10px] font-mono" style={{ color: 'var(--gx-cyan-dim)' }}>
                  {audioMode.replace('_', ' ').toUpperCase()} MODE
                </div>
              </div>
            </div>

            {/* Signal visualization */}
            <div className="flex items-center gap-0.5 h-8">
              {signalBars.map((v, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  animate={{ height: `${6 + v * 18}px` }}
                  transition={{ duration: 0.15 }}
                  style={{
                    background: isAudioPlaying
                      ? `rgba(0, 229, 255, ${0.2 + v * 0.8})`
                      : 'rgba(255,255,255,0.06)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 mb-2">
            <button onClick={onToggleMute} className="shrink-0 p-1">
              {isMuted ? (
                <VolumeX className="w-4 h-4" style={{ color: 'var(--gx-text-muted)' }} />
              ) : (
                <Volume2 className="w-4 h-4" style={{ color: 'var(--gx-cyan)' }} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="flex-1"
              style={{
                background: `linear-gradient(to right, var(--gx-cyan) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.06) ${isMuted ? 0 : volume}%)`,
              }}
            />
            <span className="text-[10px] font-mono font-bold w-10 text-right" style={{ color: 'var(--gx-cyan)' }}>
              {isMuted ? 0 : volume}%
            </span>
          </div>

          {/* Last narration */}
          {lastNarration && (
            <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(0, 229, 255, 0.03)', border: '1px solid var(--gx-border)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Mic className="w-3 h-3" style={{ color: 'var(--gx-cyan-dim)' }} />
                <span className="text-[8px] font-mono tracking-wider" style={{ color: 'var(--gx-cyan-dim)' }}>
                  LAST NARRATION
                </span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--gx-text-secondary)' }}>
                {lastNarration}
              </p>
            </div>
          )}
        </div>

        {/* Audio Modes */}
        <div className="mb-5">
          <div className="text-[9px] font-mono font-bold tracking-wider mb-3" style={{ color: 'var(--gx-cyan)' }}>
            AUDIO MODES
          </div>
          <div className="space-y-2">
            {audioModes.map((mode, i) => {
              const Icon = mode.icon;
              const isActive = audioMode === mode.id;
              return (
                <motion.button
                  key={mode.id}
                  onClick={() => onAudioModeChange(mode.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="w-full text-left p-4 rounded-xl transition-all hover-glow"
                  style={{
                    background: isActive ? 'rgba(0, 229, 255, 0.06)' : 'rgba(255, 255, 255, 0.015)',
                    border: `1px solid ${isActive ? 'rgba(0,229,255,0.2)' : 'var(--gx-border)'}`,
                    boxShadow: isActive ? '0 0 16px rgba(0,229,255,0.04)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: isActive ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.03)' }}>
                      <Icon className="w-4 h-4" style={{ color: isActive ? 'var(--gx-cyan)' : 'var(--gx-text-muted)' }} />
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: isActive ? 'var(--gx-cyan)' : 'var(--gx-text-primary)' }}>
                      {mode.label}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-[7px] font-mono font-bold px-1.5 py-0.5 rounded animate-blink"
                        style={{ background: 'rgba(0, 229, 255, 0.12)', color: 'var(--gx-cyan)', border: '1px solid rgba(0,229,255,0.15)' }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] leading-relaxed ml-11" style={{ color: 'var(--gx-text-muted)' }}>
                    {mode.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Audio Settings */}
        <div>
          <div className="text-[9px] font-mono font-bold tracking-wider mb-3" style={{ color: 'var(--gx-cyan)' }}>
            AUDIO SETTINGS
          </div>
          <div className="space-y-2">
            {[
              { label: 'Ambient Sounds', icon: Waves, value: ambientEnabled, onChange: (v: boolean) => { setAmbientEnabled(v); audioEngine.setAmbientEnabled(v); } },
              { label: 'Voice Narration', icon: Mic, value: voiceEnabled, onChange: (v: boolean) => { setVoiceEnabled(v); audioEngine.setVoiceEnabled(v); } },
              { label: 'Notification Sounds', icon: Volume2, value: notificationsEnabled, onChange: (v: boolean) => { setNotificationsEnabled(v); audioEngine.setNotificationsEnabled(v); } },
            ].map(({ label, icon: Icon, value, onChange }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--gx-border)' }}>
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5" style={{ color: value ? 'var(--gx-cyan)' : 'var(--gx-text-muted)' }} />
                  <span className="text-[10px] font-medium" style={{ color: 'var(--gx-text-secondary)' }}>{label}</span>
                </div>
                <button
                  onClick={() => onChange(!value)}
                  className="w-9 h-5 rounded-full relative transition-all duration-200"
                  style={{ background: value ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)' }}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full absolute top-0.5"
                    animate={{ left: value ? '18px' : '2px' }}
                    transition={{ duration: 0.2 }}
                    style={{ background: value ? 'var(--gx-cyan)' : 'var(--gx-text-muted)' }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
