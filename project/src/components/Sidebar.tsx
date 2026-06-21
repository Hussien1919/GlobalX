import { motion } from 'framer-motion';
import {
  Globe, Map, Brain, Bell, Crosshair, FileText, Eye,
  Headphones, Settings, Shield, Zap, Radio, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  alertCount: number;
}

const navItems = [
  { id: 'map', label: 'Global Map', icon: Globe, color: 'var(--gx-cyan)' },
  { id: 'regions', label: 'Regions', icon: Map, color: 'var(--gx-blue)' },
  { id: 'analysis', label: 'AI Briefing', icon: Brain, color: 'var(--gx-cyan)' },
  { id: 'alerts', label: 'Alerts', icon: Bell, color: 'var(--gx-red)', badge: true },
  { id: 'tracking', label: 'Tracking', icon: Crosshair, color: 'var(--gx-green)' },
  { id: 'reports', label: 'Reports', icon: FileText, color: 'var(--gx-yellow)' },
  { id: 'watchlist', label: 'Watchlists', icon: Eye, color: 'var(--gx-orange)' },
  { id: 'audio', label: 'Audio Center', icon: Headphones, color: 'var(--gx-cyan)' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'var(--gx-text-muted)' },
];

export default function Sidebar({ activeView, onViewChange, alertCount }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${collapsed ? 'w-14' : 'w-14 lg:w-52'} h-full glass flex flex-col py-3 z-50 shrink-0 transition-all duration-300`}
    >
      {/* Logo */}
      <div className="px-3 mb-5 flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95"
          style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.2)', boxShadow: '0 0 20px rgba(0, 229, 255, 0.06)' }}
        >
          <Shield className="w-4.5 h-4.5" style={{ color: 'var(--gx-cyan)' }} />
        </div>
        <div className={`hidden lg:flex flex-col overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-32 opacity-100'}`}>
          <span className="text-xs font-bold tracking-[0.2em] glow-text" style={{ color: 'var(--gx-cyan)' }}>
            GLOBALX
          </span>
          <span className="text-[7px] font-mono tracking-wider" style={{ color: 'var(--gx-text-muted)' }}>
            INTEL PLATFORM
          </span>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center mx-2 mb-3 py-1 rounded-md transition-all hover-glow"
        style={{ border: '1px solid var(--gx-border)', color: 'var(--gx-text-muted)' }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all duration-200 relative hover:translate-x-0.5 active:scale-[0.97]"
              style={{
                background: isActive ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(0, 229, 255, 0.2)' : 'transparent'}`,
                boxShadow: isActive ? '0 0 16px rgba(0, 229, 255, 0.04)' : 'none',
              }}
            >
              <div className="relative shrink-0">
                <Icon
                  className="w-[18px] h-[18px] transition-colors duration-200"
                  style={{ color: isActive ? item.color : 'var(--gx-text-muted)' }}
                />
                {item.badge && alertCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold animate-breaking"
                    style={{ background: 'rgba(255, 23, 68, 0.25)', color: 'var(--gx-red)', border: '1px solid rgba(255,23,68,0.3)' }}>
                    {alertCount}
                  </span>
                )}
              </div>
              <span
                className={`hidden lg:block text-[11px] font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
                style={{ color: isActive ? 'var(--gx-text-primary)' : 'var(--gx-text-secondary)' }}
              >
                {item.label}
              </span>
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: 'var(--gx-cyan)', boxShadow: '0 0 8px var(--gx-cyan-glow)' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Status footer */}
      <div className="px-3 pt-3 border-t" style={{ borderColor: 'var(--gx-border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Radio className="w-4 h-4 animate-blink" style={{ color: 'var(--gx-green)' }} />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gx-green)', boxShadow: '0 0 6px var(--gx-green)' }} />
          </div>
          <div className={`hidden lg:flex flex-col overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--gx-green)' }}>
              LIVE
            </span>
            <span className="text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
              OSINT ACTIVE
            </span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 mt-2">
          <Zap className="w-3 h-3" style={{ color: 'var(--gx-cyan-dim)' }} />
          <span className={`text-[8px] font-mono overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`} style={{ color: 'var(--gx-text-muted)' }}>
            SECURE CONNECTION
          </span>
        </div>
      </div>
    </motion.aside>
  );
}
