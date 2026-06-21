import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Activity, Zap, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { globalEvents, liveFeedMessages } from '../data/globalEvents';
import { Severity } from '../types';
import { useState, useEffect, useRef } from 'react';

const severityColors: Record<Severity, string> = {
  critical: 'var(--gx-red)',
  high: 'var(--gx-orange)',
  medium: 'var(--gx-yellow)',
  low: 'var(--gx-green)',
};

export default function LiveFeed() {
  const [feedItems, setFeedItems] = useState<Array<{
    id: number;
    text: string;
    type: 'event' | 'intel' | 'breaking';
    timestamp: Date;
    severity?: Severity;
    category?: string;
  }>>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial = globalEvents.slice(0, 5).map((e, i) => ({
      id: i,
      text: `[${e.type.toUpperCase()}] ${e.title}`,
      type: (e.severity === 'critical' ? 'breaking' : 'event') as 'event' | 'intel' | 'breaking',
      timestamp: e.timestamp,
      severity: e.severity,
      category: e.type,
    }));
    setFeedItems(initial);

    let counter = initial.length;
    const interval = setInterval(() => {
      const rand = Math.random();
      const isIntel = rand > 0.6;
      const isBreaking = rand < 0.1;
      const text = isIntel
        ? liveFeedMessages[Math.floor(Math.random() * liveFeedMessages.length)]
        : `[${globalEvents[Math.floor(Math.random() * globalEvents.length)].type.toUpperCase()}] ${globalEvents[Math.floor(Math.random() * globalEvents.length)].title}`;

      const sev = isBreaking ? 'critical' as Severity : (['low', 'medium', 'high'] as Severity[])[Math.floor(Math.random() * 3)];
      setFeedItems(prev => {
        const next = [...prev, {
          id: counter++,
          text,
          type: isBreaking ? 'breaking' as const : isIntel ? 'intel' as const : 'event' as const,
          timestamp: new Date(),
          severity: sev,
        }];
        return next.slice(-25);
      });
    }, 4000 + Math.random() * 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (feedRef.current && isExpanded) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [feedItems, isExpanded]);

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const breakingCount = feedItems.filter(f => f.type === 'breaking').length;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="absolute bottom-0 left-0 right-0 z-[500]"
    >
      <div className="glass mx-3 mb-3 rounded-xl overflow-hidden" style={{ maxHeight: isExpanded ? '220px' : '40px' }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 transition-all"
          style={{ borderBottom: isExpanded ? '1px solid var(--gx-border)' : 'none' }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Radio className="w-3.5 h-3.5 animate-blink" style={{ color: 'var(--gx-green)' }} />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gx-green)', boxShadow: '0 0 4px var(--gx-green)' }} />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-green)' }}>
              LIVE INTELLIGENCE FEED
            </span>
            {breakingCount > 0 && (
              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded animate-breaking"
                style={{ background: 'rgba(255,23,68,0.15)', color: 'var(--gx-red)', border: '1px solid rgba(255,23,68,0.2)' }}>
                {breakingCount} BREAKING
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
              {feedItems.length} items
            </span>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--gx-text-muted)' }} />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--gx-text-muted)' }} />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              ref={feedRef}
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-y-auto p-2 space-y-1"
              style={{ maxHeight: '175px' }}
            >
              {feedItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg"
                  style={{
                    background: item.type === 'breaking'
                      ? 'rgba(255, 23, 68, 0.06)'
                      : 'rgba(255, 255, 255, 0.015)',
                    border: item.type === 'breaking'
                      ? '1px solid rgba(255, 23, 68, 0.12)'
                      : '1px solid transparent',
                  }}
                >
                  <span className="text-[9px] font-mono shrink-0 mt-0.5" style={{ color: 'var(--gx-text-muted)' }}>
                    {formatTime(item.timestamp)}
                  </span>
                  {item.type === 'breaking' ? (
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 animate-breaking" style={{ color: 'var(--gx-red)' }} />
                  ) : item.type === 'intel' ? (
                    <Zap className="w-3 h-3 shrink-0 mt-0.5" style={{ color: 'var(--gx-cyan)' }} />
                  ) : (
                    <Activity className="w-3 h-3 shrink-0 mt-0.5" style={{ color: item.severity ? severityColors[item.severity] : 'var(--gx-cyan)' }} />
                  )}
                  <span className="text-[10px] leading-relaxed" style={{
                    color: item.type === 'breaking' ? 'var(--gx-red)' : item.type === 'intel' ? 'var(--gx-cyan-dim)' : 'var(--gx-text-secondary)',
                    fontWeight: item.type === 'breaking' ? 600 : 400,
                  }}>
                    {item.type === 'breaking' && (
                      <span className="font-mono font-bold mr-1" style={{ color: 'var(--gx-red)' }}>
                        [BREAKING]
                      </span>
                    )}
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
