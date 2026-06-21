import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, TrendingUp, Shield, Globe, AlertTriangle, Send, Volume2, Save } from 'lucide-react';
import { globalEvents, countryIntel, regionSummaries } from '../data/globalEvents';
import { useState, useEffect, useRef, useCallback } from 'react';

const suggestedPrompts = [
  'Summarize global tensions',
  'Analyze Middle East activity',
  'Show economic instability risks',
  'Assess cyber threat landscape',
  'Predict conflict escalation zones',
  'Review climate disaster patterns',
];

const aiResponses: Record<string, string> = {
  'Summarize global tensions': 'Global tensions remain at ELEVATED levels. Eastern European conflict zones show 73% escalation probability within 72 hours. Middle Eastern proxy conflicts have increased 34% quarter-over-quarter. Indo-Pacific maritime disputes continue with 12 active flashpoints. Cyber operations targeting critical infrastructure have doubled in the last 30 days. Overall risk assessment: HIGH.',
  'Analyze Middle East activity': 'Middle East analysis: 8 active conflict zones detected. Iranian proxy operations expanded across 4 fronts. Israeli defense posture at maximum readiness. Gulf maritime security incidents up 45%. Oil supply chain disruption probability at 28%. Humanitarian crisis indicators critical in 3 regions. AI confidence: 82%.',
  'Show economic instability risks': 'Economic risk assessment: 3 emerging markets approaching critical debt thresholds - Turkey (87% risk), Argentina (91% risk), Pakistan (78% risk). BRICS currency devaluation accelerating. Global supply chain stress index at 7.2/10. Cryptocurrency market volatility creating capital flight indicators in 6 jurisdictions.',
  'Assess cyber threat landscape': 'Cyber threat landscape: 147 active APT groups tracked. Energy sector attacks show coordinated signature - likely state-sponsored. Financial infrastructure probing increased 230%. Zero-day exploit marketplace activity elevated. Critical infrastructure vulnerability index: 6.8/10. Recommended threat level: HIGH.',
  'Predict conflict escalation zones': 'Conflict escalation prediction: Eastern Ukraine (89% probability), South China Sea (67% probability), Horn of Africa (54% probability), Sahel region (71% probability), Myanmar border regions (62% probability). AI model confidence weighted by signal strength and historical pattern matching.',
  'Review climate disaster patterns': 'Climate disaster analysis: Unusual cyclone intensity correlates with SST anomalies in 3 ocean basins. Drought severity index at record levels in East Africa. Wildfire season starting 3 weeks early in Mediterranean. Arctic ice loss rate 23% above 10-year average. Climate refugee displacement estimated at 4.2M in next 90 days.',
};

export default function AIAnalysis() {
  const [activeTab, setActiveTab] = useState<'briefing' | 'tensions' | 'predictions' | 'chat'>('briefing');
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [savedBriefings, setSavedBriefings] = useState<string[]>([]);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const streamResponse = useCallback((text: string) => {
    setIsStreaming(true);
    setStreamingText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setStreamingText(prev => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        setChatHistory(prev => [...prev, { role: 'ai', text }]);
      }
    }, 15);
    streamRef.current = interval;
  }, []);

  const handleSubmit = useCallback((prompt?: string) => {
    const text = prompt || chatInput;
    if (!text.trim()) return;
    setChatHistory(prev => [...prev, { role: 'user', text }]);
    setChatInput('');
    const response = aiResponses[text] || 'Analysis in progress. Based on current intelligence data, the global situation requires continued monitoring. Multiple threat vectors are being tracked across all regions. Recommend maintaining current alert posture and increasing surveillance on identified flashpoints.';
    setTimeout(() => streamResponse(response), 500);
  }, [chatInput, streamResponse]);

  const handleSave = useCallback(() => {
    const last = chatHistory.filter(h => h.role === 'ai').pop();
    if (last && !savedBriefings.includes(last.text)) {
      setSavedBriefings(prev => [...prev, last.text]);
    }
  }, [chatHistory, savedBriefings]);

  useEffect(() => {
    return () => {
      if (streamRef.current) clearInterval(streamRef.current);
    };
  }, []);

  const criticalEvents = globalEvents.filter(e => e.severity === 'critical');
  const highEvents = globalEvents.filter(e => e.severity === 'high');

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.2)', boxShadow: '0 0 20px rgba(0, 229, 255, 0.04)' }}>
              <Brain className="w-5 h-5" style={{ color: 'var(--gx-cyan)' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--gx-text-primary)' }}>AI Intelligence Center</h1>
              <p className="text-[10px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>Powered by GLOBALX Neural Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(0, 230, 118, 0.06)', border: '1px solid rgba(0, 230, 118, 0.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-glow-pulse" style={{ background: 'var(--gx-green)' }} />
            <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--gx-green)' }}>ONLINE</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--gx-border)' }}>
          {[
            { id: 'briefing' as const, label: 'Briefing' },
            { id: 'tensions' as const, label: 'Tensions' },
            { id: 'predictions' as const, label: 'Predictions' },
            { id: 'chat' as const, label: 'AI Chat' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 px-3 py-2 rounded-md text-[10px] font-mono font-bold tracking-wider transition-all duration-200"
              style={{
                background: activeTab === tab.id ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                color: activeTab === tab.id ? 'var(--gx-cyan)' : 'var(--gx-text-muted)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(0, 229, 255, 0.15)' : 'transparent'}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Briefing Tab */}
          {activeTab === 'briefing' && (
            <motion.div key="briefing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'CRITICAL', value: criticalEvents.length, color: 'var(--gx-red)', icon: AlertTriangle },
                  { label: 'HIGH', value: highEvents.length, color: 'var(--gx-orange)', icon: Shield },
                  { label: 'REGIONS', value: Object.keys(countryIntel).length, color: 'var(--gx-cyan)', icon: Globe },
                  { label: 'EVENTS', value: globalEvents.length, color: 'var(--gx-yellow)', icon: Zap },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-4 h-4" style={{ color: stat.color }} />
                        <span className="text-[7px] font-mono tracking-wider" style={{ color: 'var(--gx-text-muted)' }}>{stat.label}</span>
                      </div>
                      <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="glass-card p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4" style={{ color: 'var(--gx-cyan)' }} />
                  <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-cyan)' }}>REGIONAL ANALYSIS</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(regionSummaries).map(([region, summary], i) => (
                    <motion.div key={region} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-lg transition-all hover-glow" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--gx-border)' }}>
                      <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--gx-text-primary)' }}>{region}</div>
                      <p className="text-[9px] leading-relaxed" style={{ color: 'var(--gx-text-muted)' }}>{summary}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tensions Tab */}
          {activeTab === 'tensions' && (
            <motion.div key="tensions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="glass-card p-4 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4" style={{ color: 'var(--gx-orange)' }} />
                  <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-orange)' }}>GEOPOLITICAL TENSION MAP</span>
                </div>
                <div className="space-y-3">
                  {Object.values(countryIntel).sort((a, b) => b.conflictRisk - a.conflictRisk).map((country, i) => (
                    <motion.div key={country.code} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-mono w-28 truncate" style={{ color: 'var(--gx-text-primary)' }}>{country.name}</span>
                        <div className="flex-1 progress-bar">
                          <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${country.conflictRisk}%` }} transition={{ duration: 0.8, delay: i * 0.04 }}
                            style={{ background: country.conflictRisk > 80 ? 'var(--gx-red)' : country.conflictRisk > 50 ? 'var(--gx-orange)' : 'var(--gx-yellow)' }} />
                        </div>
                        <span className="text-[10px] font-mono font-bold w-8 text-right" style={{ color: country.conflictRisk > 80 ? 'var(--gx-red)' : 'var(--gx-text-secondary)' }}>{country.conflictRisk}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4" style={{ color: 'var(--gx-cyan)' }} />
                  <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-cyan)' }}>CYBER ACTIVITY INDEX</span>
                </div>
                <div className="space-y-3">
                  {Object.values(countryIntel).sort((a, b) => b.cyberActivity - a.cyberActivity).map((country, i) => (
                    <motion.div key={country.code} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-mono w-28 truncate" style={{ color: 'var(--gx-text-primary)' }}>{country.name}</span>
                        <div className="flex-1 progress-bar">
                          <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${country.cyberActivity}%` }} transition={{ duration: 0.8, delay: i * 0.04 }}
                            style={{ background: country.cyberActivity > 80 ? 'var(--gx-cyan)' : country.cyberActivity > 50 ? 'var(--gx-blue)' : 'var(--gx-text-muted)' }} />
                        </div>
                        <span className="text-[10px] font-mono font-bold w-8 text-right" style={{ color: 'var(--gx-cyan)' }}>{country.cyberActivity}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Predictions Tab */}
          {activeTab === 'predictions' && (
            <motion.div key="predictions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4" style={{ color: 'var(--gx-yellow)' }} />
                  <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-yellow)' }}>PREDICTIVE ANALYSIS</span>
                </div>
                <div className="space-y-3">
                  {[
                    { title: 'Eastern European Escalation', probability: 73, trend: 'up', impact: 'Critical' },
                    { title: 'Global Cyber Campaign Expansion', probability: 68, trend: 'up', impact: 'High' },
                    { title: 'Emerging Market Debt Crisis', probability: 55, trend: 'up', impact: 'High' },
                    { title: 'South China Sea Incident', probability: 42, trend: 'stable', impact: 'High' },
                    { title: 'Climate Disaster Cascade', probability: 61, trend: 'up', impact: 'Critical' },
                    { title: 'Middle East Nuclear Breakthrough', probability: 28, trend: 'down', impact: 'Medium' },
                    { title: 'West African Coup Chain', probability: 35, trend: 'up', impact: 'Medium' },
                    { title: 'Global Supply Chain Disruption', probability: 48, trend: 'stable', impact: 'High' },
                  ].map((pred, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--gx-border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--gx-text-primary)' }}>{pred.title}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: pred.probability > 60 ? 'rgba(255, 23, 68, 0.12)' : pred.probability > 40 ? 'rgba(255, 145, 0, 0.12)' : 'rgba(0, 230, 118, 0.12)',
                            color: pred.probability > 60 ? 'var(--gx-red)' : pred.probability > 40 ? 'var(--gx-orange)' : 'var(--gx-green)',
                          }}>
                          {pred.probability}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${pred.probability}%` }} transition={{ duration: 0.8, delay: i * 0.06 }}
                          style={{ background: pred.probability > 60 ? 'var(--gx-red)' : pred.probability > 40 ? 'var(--gx-orange)' : 'var(--gx-green)' }} />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>Trend: {pred.trend.toUpperCase()}</span>
                        <span className="text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>Impact: {pred.impact}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Chat Tab */}
          {activeTab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {chatHistory.length === 0 && (
                <div className="mb-6">
                  <div className="text-[9px] font-mono tracking-wider mb-3" style={{ color: 'var(--gx-text-muted)' }}>SUGGESTED PROMPTS</div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {suggestedPrompts.map((prompt, i) => (
                      <motion.button key={prompt} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        onClick={() => handleSubmit(prompt)}
                        className="text-left px-3 py-2.5 rounded-lg text-[10px] transition-all hover-glow"
                        style={{ background: 'rgba(0, 229, 255, 0.03)', border: '1px solid var(--gx-border)', color: 'var(--gx-text-secondary)' }}>
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-4">
                {chatHistory.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                      style={{ background: msg.role === 'user' ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${msg.role === 'user' ? 'rgba(0,229,255,0.15)' : 'var(--gx-border)'}` }}>
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Brain className="w-3 h-3" style={{ color: 'var(--gx-cyan)' }} />
                          <span className="text-[8px] font-mono font-bold" style={{ color: 'var(--gx-cyan)' }}>GLOBALX AI</span>
                        </div>
                      )}
                      <p className="text-[10px] leading-relaxed" style={{ color: msg.role === 'user' ? 'var(--gx-cyan)' : 'var(--gx-text-secondary)' }}>{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-xl rounded-bl-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--gx-border)' }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Brain className="w-3 h-3" style={{ color: 'var(--gx-cyan)' }} />
                        <span className="text-[8px] font-mono font-bold" style={{ color: 'var(--gx-cyan)' }}>GLOBALX AI</span>
                      </div>
                      <p className="text-[10px] leading-relaxed" style={{ color: 'var(--gx-text-secondary)' }}>
                        {streamingText}<span className="animate-typing" style={{ color: 'var(--gx-cyan)' }}>|</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {chatHistory.length > 0 && !isStreaming && (
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={handleSave} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-mono transition-all hover-glow"
                    style={{ border: '1px solid var(--gx-border)', color: 'var(--gx-text-muted)' }}>
                    <Save className="w-3 h-3" /> Save Briefing
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-mono transition-all hover-glow"
                    style={{ border: '1px solid var(--gx-border)', color: 'var(--gx-text-muted)' }}>
                    <Volume2 className="w-3 h-3" /> Read Aloud
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: 'rgba(0,229,255,0.02)', border: '1px solid var(--gx-border)' }}>
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} placeholder="Ask GLOBALX AI..."
                  className="flex-1 bg-transparent border-none outline-none text-[11px] px-3 py-2.5"
                  style={{ color: 'var(--gx-text-primary)' }} disabled={isStreaming} />
                <button onClick={() => handleSubmit()} disabled={isStreaming || !chatInput.trim()}
                  className="p-2.5 rounded-lg transition-all"
                  style={{ background: chatInput.trim() ? 'rgba(0, 229, 255, 0.1)' : 'transparent', color: chatInput.trim() ? 'var(--gx-cyan)' : 'var(--gx-text-muted)', border: `1px solid ${chatInput.trim() ? 'rgba(0,229,255,0.2)' : 'transparent'}` }}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
