import { motion } from 'framer-motion';
import { Search, Wifi, Activity, Clock, Shield, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false });
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-11 glass flex items-center justify-between px-4 z-40 shrink-0"
      style={{ borderBottom: '1px solid var(--gx-border)' }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4" style={{ color: 'var(--gx-cyan)' }} />
          <span className="text-[10px] font-bold tracking-[0.15em] glow-text hidden sm:block"
            style={{ color: 'var(--gx-cyan)' }}>
            GLOBALX
          </span>
          <span className="text-[7px] font-mono px-1.5 py-0.5 rounded hidden md:block"
            style={{ background: 'rgba(0, 229, 255, 0.08)', color: 'var(--gx-cyan-dim)', border: '1px solid rgba(0,229,255,0.1)' }}>
            v2.0
          </span>
        </div>

        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
          searchFocused ? 'w-64' : 'w-48'
        }`}
          style={{
            background: searchFocused ? 'rgba(0, 229, 255, 0.04)' : 'rgba(0, 229, 255, 0.02)',
            border: `1px solid ${searchFocused ? 'rgba(0, 229, 255, 0.2)' : 'var(--gx-border)'}`,
            boxShadow: searchFocused ? '0 0 16px rgba(0, 229, 255, 0.04)' : 'none',
          }}>
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: searchFocused ? 'var(--gx-cyan)' : 'var(--gx-text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search intelligence..."
            className="bg-transparent border-none outline-none text-[11px] w-full"
            style={{ color: 'var(--gx-text-primary)' }}
          />
          {searchQuery && (
            <span className="text-[8px] font-mono px-1 py-0.5 rounded" style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--gx-cyan)' }}>
              {searchQuery.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status indicators */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md"
            style={{ background: 'rgba(0, 230, 118, 0.05)', border: '1px solid rgba(0, 230, 118, 0.1)' }}>
            <Wifi className="w-3 h-3" style={{ color: 'var(--gx-green)' }} />
            <span className="text-[9px] font-mono" style={{ color: 'var(--gx-green)' }}>ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md"
            style={{ background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
            <Activity className="w-3 h-3 animate-blink" style={{ color: 'var(--gx-cyan)' }} />
            <span className="text-[9px] font-mono" style={{ color: 'var(--gx-cyan)' }}>LIVE</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md"
            style={{ background: 'rgba(255, 23, 68, 0.05)', border: '1px solid rgba(255, 23, 68, 0.1)' }}>
            <Bell className="w-3 h-3" style={{ color: 'var(--gx-red)' }} />
            <span className="text-[9px] font-mono" style={{ color: 'var(--gx-red)' }}>7</span>
          </div>
        </div>

        {/* Clock */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg"
          style={{ background: 'rgba(0, 229, 255, 0.03)', border: '1px solid var(--gx-border)' }}>
          <Clock className="w-3.5 h-3.5" style={{ color: 'var(--gx-cyan)' }} />
          <div>
            <div className="text-[10px] font-mono font-bold leading-tight" style={{ color: 'var(--gx-cyan)' }}>
              {formatTime(time)}
            </div>
            <div className="text-[7px] font-mono leading-tight" style={{ color: 'var(--gx-text-muted)' }}>
              {formatDate(time)}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
