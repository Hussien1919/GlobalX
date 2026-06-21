import { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import GlobalMap from './components/GlobalMap';
import RightPanel from './components/RightPanel';
import LiveFeed from './components/LiveFeed';
import BootSequence from './components/BootSequence';
import { audioEngine } from './audio/AudioEngine';
import { GlobalEvent, CountryIntel, AudioMode } from './types';

const AlertsPanel = lazy(() => import('./components/AlertsPanel'));
const AIAnalysis = lazy(() => import('./components/AIAnalysis'));
const AudioCenter = lazy(() => import('./components/AudioCenter'));
const WatchlistPanel = lazy(() => import('./components/WatchlistPanel'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));
const RegionsPanel = lazy(() => import('./components/RegionsPanel'));
const TrackingPanel = lazy(() => import('./components/TrackingPanel'));
const ReportsPanel = lazy(() => import('./components/ReportsPanel'));

function LoadingFallback() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="space-y-3 w-64">
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}

function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 20}s`,
      duration: `${15 + Math.random() * 20}s`,
      size: Math.random() > 0.7 ? 2 : 1,
      opacity: 0.15 + Math.random() * 0.25,
    })), []);

  return (
    <div className="particles-container">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [booted, setBooted] = useState(false);
  const [activeView, setActiveView] = useState('map');
  const [selectedEvent, setSelectedEvent] = useState<GlobalEvent | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryIntel | null>(null);
  const [flyToCode, setFlyToCode] = useState<string | null>(null);
  const [audioMode, setAudioMode] = useState<AudioMode>('global_radio');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [alertCount] = useState(7);

  useEffect(() => {
    if (booted) {
      audioEngine.playBootSequence();
    }
  }, [booted]);

  const handleToggleAudio = useCallback(() => {
    if (isAudioPlaying) {
      audioEngine.stop();
      setIsAudioPlaying(false);
    } else {
      audioEngine.start();
      setIsAudioPlaying(true);
    }
  }, [isAudioPlaying]);

  const handleToggleMute = useCallback(() => {
    const newMuted = !isMuted;
    audioEngine.setMuted(newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    audioEngine.setVolume(v);
  }, []);

  const handleAudioModeChange = useCallback((mode: AudioMode) => {
    setAudioMode(mode);
    audioEngine.setMode(mode);
  }, []);

  const handleEventSelect = useCallback((event: GlobalEvent) => {
    setSelectedEvent(event);
    setSelectedCountry(null);
    audioEngine.playNotification();
  }, []);

  const handleCountrySelect = useCallback((intel: CountryIntel) => {
    setSelectedCountry(intel);
    setSelectedEvent(null);
    setFlyToCode(intel.code);
    audioEngine.playNotification();
  }, []);

  const isMapView = activeView === 'map';

  const renderMainContent = () => {
    switch (activeView) {
      case 'map':
        return (
          <div className="relative w-full h-full">
            <GlobalMap onEventSelect={handleEventSelect} onCountrySelect={handleCountrySelect} flyToCode={flyToCode} />
            <LiveFeed />
          </div>
        );
      case 'regions':
        return <Suspense fallback={<LoadingFallback />}><RegionsPanel onCountrySelect={handleCountrySelect} /></Suspense>;
      case 'analysis':
        return <Suspense fallback={<LoadingFallback />}><AIAnalysis /></Suspense>;
      case 'alerts':
        return <Suspense fallback={<LoadingFallback />}><AlertsPanel onEventSelect={handleEventSelect} /></Suspense>;
      case 'tracking':
        return <Suspense fallback={<LoadingFallback />}><TrackingPanel /></Suspense>;
      case 'reports':
        return <Suspense fallback={<LoadingFallback />}><ReportsPanel /></Suspense>;
      case 'watchlist':
        return <Suspense fallback={<LoadingFallback />}><WatchlistPanel onCountrySelect={handleCountrySelect} /></Suspense>;
      case 'audio':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AudioCenter
              audioMode={audioMode}
              onAudioModeChange={handleAudioModeChange}
              isAudioPlaying={isAudioPlaying}
              onToggleAudio={handleToggleAudio}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              volume={volume}
              onVolumeChange={handleVolumeChange}
            />
          </Suspense>
        );
      case 'settings':
        return <Suspense fallback={<LoadingFallback />}><SettingsPanel /></Suspense>;
      default:
        return (
          <div className="relative w-full h-full">
            <GlobalMap onEventSelect={handleEventSelect} onCountrySelect={handleCountrySelect} flyToCode={flyToCode} />
            <LiveFeed />
          </div>
        );
    }
  };

  return (
    <>
      <AnimatePresence>
        {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      </AnimatePresence>

      {booted && (
        <div className="h-screen w-screen flex flex-col overflow-hidden relative" style={{ background: 'var(--gx-bg-primary)' }}>
          <Particles />
          <TopBar />
          <div className="flex flex-1 min-h-0 relative z-10">
            <Sidebar
              activeView={activeView}
              onViewChange={setActiveView}
              alertCount={alertCount}
            />

            {/* Main content area */}
            <main className={`flex-1 min-w-0 relative ${isMapView ? '' : 'overflow-y-auto'}`}>
              {renderMainContent()}
            </main>

            {/* Right panel - only show on map view */}
            {isMapView && (
              <RightPanel
                selectedEvent={selectedEvent}
                selectedCountry={selectedCountry}
                audioMode={audioMode}
                onAudioModeChange={handleAudioModeChange}
                isAudioPlaying={isAudioPlaying}
                onToggleAudio={handleToggleAudio}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                volume={volume}
                onVolumeChange={handleVolumeChange}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
