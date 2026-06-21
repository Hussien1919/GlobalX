import { motion } from 'framer-motion';
import { FileText, Download, Brain, Activity, Clock } from 'lucide-react';
import { Severity } from '../types';
import { useState } from 'react';

const severityColors: Record<Severity, string> = {
  critical: 'var(--gx-red)',
  high: 'var(--gx-orange)',
  medium: 'var(--gx-yellow)',
  low: 'var(--gx-green)',
};

interface Report {
  id: string;
  title: string;
  type: 'daily' | 'regional' | 'threat' | 'economic';
  timestamp: string;
  summary: string;
  severity?: Severity;
}

const reports: Report[] = [
  { id: 'rpt-001', title: 'Global Daily Intelligence Brief', type: 'daily', timestamp: new Date().toISOString(), severity: 'high', summary: 'Comprehensive overview of all active global events, threat assessments, and regional developments from the past 24 hours.' },
  { id: 'rpt-002', title: 'Eastern European Conflict Assessment', type: 'regional', timestamp: new Date(Date.now() - 3600000).toISOString(), severity: 'critical', summary: 'Detailed analysis of the escalating conflict in Eastern Europe, including military movements, diplomatic developments, and humanitarian impact.' },
  { id: 'rpt-003', title: 'Global Cyber Threat Landscape', type: 'threat', timestamp: new Date(Date.now() - 7200000).toISOString(), severity: 'high', summary: 'Analysis of active APT groups, infrastructure targeting patterns, and emerging cyber threats across critical sectors.' },
  { id: 'rpt-004', title: 'Emerging Markets Economic Risk Report', type: 'economic', timestamp: new Date(Date.now() - 14400000).toISOString(), severity: 'medium', summary: 'Assessment of economic instability indicators, currency devaluation risks, and debt sustainability across emerging market economies.' },
  { id: 'rpt-005', title: 'Asia-Pacific Security Brief', type: 'regional', timestamp: new Date(Date.now() - 28800000).toISOString(), severity: 'high', summary: 'Maritime disputes, military posturing, and diplomatic developments across the South China Sea and broader Indo-Pacific region.' },
  { id: 'rpt-006', title: 'Climate Disaster Impact Assessment', type: 'threat', timestamp: new Date(Date.now() - 43200000).toISOString(), severity: 'critical', summary: 'Analysis of active climate disasters, displacement patterns, and cascading humanitarian impacts across affected regions.' },
];

const typeColors = {
  daily: 'var(--gx-cyan)',
  regional: 'var(--gx-blue)',
  threat: 'var(--gx-orange)',
  economic: 'var(--gx-yellow)',
};

export default function ReportsPanel() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = (id: string) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 3000);
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255, 214, 0, 0.08)', border: '1px solid rgba(255, 214, 0, 0.2)' }}>
            <FileText className="w-5 h-5" style={{ color: 'var(--gx-yellow)' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--gx-text-primary)' }}>Intelligence Reports</h1>
            <p className="text-[10px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>{reports.length} reports available</p>
          </div>
        </div>

        <button
          onClick={() => handleGenerate('new')}
          className="w-full p-4 rounded-xl mb-5 flex items-center justify-center gap-2.5 transition-all hover-glow"
          style={{ background: 'rgba(0, 229, 255, 0.04)', border: '1px solid rgba(0,229,255,0.2)' }}
        >
          {generating === 'new' ? (
            <>
              <Activity className="w-4 h-4 animate-blink" style={{ color: 'var(--gx-cyan)' }} />
              <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-cyan)' }}>GENERATING...</span>
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" style={{ color: 'var(--gx-cyan)' }} />
              <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: 'var(--gx-cyan)' }}>GENERATE AI BRIEFING</span>
            </>
          )}
        </button>
      </motion.div>

      <div className="space-y-2 flex-1">
        {reports.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${typeColors[report.type]}10`, color: typeColors[report.type], border: `1px solid ${typeColors[report.type]}20` }}>
                  {report.type.toUpperCase()}
                </span>
                {report.severity && (
                  <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${severityColors[report.severity]}10`, color: severityColors[report.severity], border: `1px solid ${severityColors[report.severity]}20` }}>
                    {report.severity.toUpperCase()}
                  </span>
                )}
              </div>
              <button onClick={() => handleGenerate(report.id)} className="p-1.5 rounded-lg transition-all hover-glow"
                style={{ border: '1px solid var(--gx-border)' }}>
                {generating === report.id ? (
                  <Activity className="w-3 h-3 animate-blink" style={{ color: 'var(--gx-cyan)' }} />
                ) : (
                  <Download className="w-3 h-3" style={{ color: 'var(--gx-text-muted)' }} />
                )}
              </button>
            </div>
            <h3 className="text-[11px] font-bold mb-1.5" style={{ color: 'var(--gx-text-primary)' }}>
              {report.title}
            </h3>
            <p className="text-[10px] leading-relaxed mb-2" style={{ color: 'var(--gx-text-muted)' }}>
              {report.summary}
            </p>
            <div className="flex items-center gap-1.5 text-[8px] font-mono" style={{ color: 'var(--gx-text-muted)' }}>
              <Clock className="w-2.5 h-2.5" />
              {new Date(report.timestamp).toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
