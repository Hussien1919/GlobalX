import { motion } from 'framer-motion';
import { Settings, Shield, Crown, Check, Lock, Info, Eye, Zap } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPanel() {
  const [membershipTier, setMembershipTier] = useState<'free' | 'pro'>('free');
  const [displaySettings, setDisplaySettings] = useState({
    scanLine: true,
    radar: true,
    pulseMarkers: true,
    autoScroll: true,
    tacticalGrid: false,
  });

  const toggleSetting = (key: keyof typeof displaySettings) => {
    setDisplaySettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(100, 116, 139, 0.08)', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
            <Settings className="w-5 h-5" style={{ color: 'var(--gx-text-muted)' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--gx-text-primary)' }}>Settings</h1>
            <p className="text-[10px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>Platform configuration</p>
          </div>
        </div>

        {/* Membership */}
        <div className="mb-6">
          <div className="text-[9px] font-mono font-bold tracking-wider mb-3" style={{ color: 'var(--gx-cyan)' }}>
            MEMBERSHIP
          </div>
          <div className="space-y-2">
            <div className="glass-card p-4"
              style={{ borderColor: membershipTier === 'free' ? 'rgba(0,229,255,0.2)' : undefined }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.06)' }}>
                    <Shield className="w-4 h-4" style={{ color: 'var(--gx-cyan)' }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--gx-text-primary)' }}>Free</span>
                </div>
                {membershipTier === 'free' && (
                  <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--gx-cyan)', border: '1px solid rgba(0,229,255,0.15)' }}>
                    CURRENT
                  </span>
                )}
              </div>
              <ul className="space-y-1.5 ml-1">
                {['Basic LIVE map', 'Limited audio modes', 'Public news feeds', 'Demo AI summaries', '5 watchlist items'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--gx-text-secondary)' }}>
                    <Check className="w-3 h-3 shrink-0" style={{ color: 'var(--gx-green)' }} />{feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-4"
              style={{ borderColor: membershipTier === 'pro' ? 'rgba(255,214,0,0.2)' : undefined }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,214,0,0.06)' }}>
                    <Crown className="w-4 h-4" style={{ color: 'var(--gx-yellow)' }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--gx-text-primary)' }}>Pro</span>
                </div>
                {membershipTier === 'pro' ? (
                  <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--gx-cyan)', border: '1px solid rgba(0,229,255,0.15)' }}>
                    CURRENT
                  </span>
                ) : (
                  <button onClick={() => setMembershipTier('pro')}
                    className="text-[8px] font-mono font-bold px-2.5 py-1 rounded-lg transition-all hover-glow"
                    style={{ background: 'rgba(255, 214, 0, 0.08)', color: 'var(--gx-yellow)', border: '1px solid rgba(255, 214, 0, 0.2)' }}>
                    UPGRADE
                  </button>
                )}
              </div>
              <ul className="space-y-1.5 ml-1">
                {['Full LIVE intelligence map', 'Advanced AI analysis', 'Full immersive audio system', 'Voice assistant', 'Advanced overlays & heatmaps', 'Real-time alerts', 'Premium tracking', 'Unlimited watchlist', 'Multi-panel command center'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--gx-text-secondary)' }}>
                    {membershipTier === 'pro' ? (
                      <Check className="w-3 h-3 shrink-0" style={{ color: 'var(--gx-green)' }} />
                    ) : (
                      <Lock className="w-3 h-3 shrink-0" style={{ color: 'var(--gx-text-muted)' }} />
                    )}
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="mb-6">
          <div className="text-[9px] font-mono font-bold tracking-wider mb-3" style={{ color: 'var(--gx-cyan)' }}>
            DISPLAY
          </div>
          <div className="space-y-2">
            {[
              { key: 'scanLine' as const, label: 'Scan Line Effect', icon: Eye },
              { key: 'radar' as const, label: 'Radar Animation', icon: Zap },
              { key: 'pulseMarkers' as const, label: 'Event Pulse Markers', icon: Eye },
              { key: 'autoScroll' as const, label: 'Live Feed Auto-scroll', icon: Eye },
              { key: 'tacticalGrid' as const, label: 'Tactical Grid Overlay', icon: Eye },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--gx-border)' }}>
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5" style={{ color: displaySettings[key] ? 'var(--gx-cyan)' : 'var(--gx-text-muted)' }} />
                  <span className="text-[10px] font-medium" style={{ color: 'var(--gx-text-secondary)' }}>{label}</span>
                </div>
                <button onClick={() => toggleSetting(key)}
                  className="w-9 h-5 rounded-full relative transition-all duration-200"
                  style={{ background: displaySettings[key] ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)' }}>
                  <motion.div className="w-4 h-4 rounded-full absolute top-0.5"
                    animate={{ left: displaySettings[key] ? '18px' : '2px' }}
                    transition={{ duration: 0.2 }}
                    style={{ background: displaySettings[key] ? 'var(--gx-cyan)' : 'var(--gx-text-muted)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div>
          <div className="text-[9px] font-mono font-bold tracking-wider mb-3" style={{ color: 'var(--gx-cyan)' }}>
            ABOUT
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <Shield className="w-4 h-4" style={{ color: 'var(--gx-cyan)' }} />
              <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--gx-cyan)' }}>GLOBALX</span>
            </div>
            <p className="text-[10px] leading-relaxed mb-2" style={{ color: 'var(--gx-text-muted)' }}>
              Global Intelligence Platform. Uses only public/open-source intelligence (OSINT), public APIs, and simulated intelligence visuals. Does not imply illegal surveillance or classified access.
            </p>
            <div className="flex items-center gap-1.5 text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
              <Info className="w-2.5 h-2.5" />
              Version 2.0.0 | OSINT ACTIVE
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
