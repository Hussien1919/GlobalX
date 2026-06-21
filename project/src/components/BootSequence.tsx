import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Shield, Globe, Activity, Zap, Radio } from 'lucide-react';

interface BootSequenceProps {
  onComplete: () => void;
}

const bootLines = [
  'INITIALIZING GLOBALX COMMAND CENTER...',
  'LOADING OSINT DATA STREAMS...',
  'CONNECTING TO INTELLIGENCE NETWORKS...',
  'CALIBRATING GLOBAL MONITORING SYSTEMS...',
  'ACTIVATING LIVE THREAT ASSESSMENT...',
  'SYNCHRONIZING REAL-TIME FEEDS...',
  'LOADING VISUALIZATION ENGINE...',
  'INITIALIZING AUDIO SYSTEMS...',
  'SCANNING GLOBAL EVENT DATABASES...',
  'SYSTEM READY. WELCOME TO GLOBALX.',
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentLine >= bootLines.length) {
      const timeout = setTimeout(onComplete, 600);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setDisplayedLines(prev => [...prev, bootLines[currentLine]]);
      setCurrentLine(prev => prev + 1);
      setProgress(((currentLine + 1) / bootLines.length) * 100);
    }, 350);

    return () => clearTimeout(timeout);
  }, [currentLine, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'var(--gx-bg-primary)' }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 tactical-grid opacity-30" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.03) 0%, transparent 70%)' }} />

      <div className="w-full max-w-2xl px-8 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex items-center justify-center gap-5 mb-14"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center animate-glow-pulse"
            style={{ background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0,229,255,0.2)', boxShadow: '0 0 40px rgba(0,229,255,0.08)' }}
          >
            <Shield className="w-8 h-8" style={{ color: 'var(--gx-cyan)' }} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-[0.3em] glow-text" style={{ color: 'var(--gx-cyan)' }}>
              GLOBALX
            </h1>
            <p className="text-[10px] tracking-[0.25em] font-mono mt-1" style={{ color: 'var(--gx-text-muted)' }}>
              GLOBAL INTELLIGENCE PLATFORM
            </p>
          </div>
        </motion.div>

        {/* Boot log */}
        <div className="space-y-1.5 mb-10 font-mono">
          {displayedLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5"
            >
              {i === displayedLines.length - 1 ? (
                <Activity className="w-3 h-3 animate-blink shrink-0" style={{ color: 'var(--gx-cyan)' }} />
              ) : (
                <span className="w-3 h-3 flex items-center justify-center text-[8px] font-bold shrink-0" style={{ color: 'var(--gx-green)' }}>
                  &#10003;
                </span>
              )}
              <span className="text-[11px]" style={{
                color: i === displayedLines.length - 1 ? 'var(--gx-cyan)' : 'var(--gx-text-secondary)',
              }}>
                {line}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--gx-cyan-dim), var(--gx-cyan))' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2.5">
            <span className="text-[8px] font-mono tracking-wider" style={{ color: 'var(--gx-text-muted)' }}>
              SYSTEM INITIALIZATION
            </span>
            <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--gx-cyan)' }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-center gap-8 mt-10">
          {[
            { icon: Globe, label: 'MAP', active: progress > 20 },
            { icon: Radio, label: 'FEEDS', active: progress > 40 },
            { icon: Zap, label: 'AI', active: progress > 60 },
            { icon: Activity, label: 'LIVE', active: progress > 80 },
          ].map(({ icon: Icon, label, active }) => (
            <motion.div
              key={label}
              animate={{ opacity: active ? 1 : 0.3 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500"
                style={{
                  background: active ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(0,229,255,0.2)' : 'var(--gx-border)'}`,
                  boxShadow: active ? '0 0 12px rgba(0,229,255,0.06)' : 'none',
                }}>
                <Icon className="w-3.5 h-3.5 transition-colors duration-500"
                  style={{ color: active ? 'var(--gx-cyan)' : 'var(--gx-text-muted)' }} />
              </div>
              <span className="text-[9px] font-mono font-bold tracking-wider transition-colors duration-500"
                style={{ color: active ? 'var(--gx-cyan)' : 'var(--gx-text-muted)' }}>
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
