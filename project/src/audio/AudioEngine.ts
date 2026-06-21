import { AudioMode } from '../types';

type AudioCallback = (message: string) => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private notificationGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private mode: AudioMode = 'global_radio';
  private volume = 70;
  private isMuted = false;
  private ambientEnabled = true;
  private voiceEnabled = true;
  private notificationsEnabled = true;
  private onNarration: AudioCallback | null = null;
  private narrationInterval: ReturnType<typeof setInterval> | null = null;
  private radarInterval: ReturnType<typeof setInterval> | null = null;

  private narrationTexts = [
    'Global tensions increased in Eastern Europe. Multiple ceasefire violations recorded in the past hour.',
    'Cyber activity spike detected across European energy infrastructure. Emergency protocols activated.',
    'New developments reported in the Middle East. Nuclear talks resume in Vienna.',
    'Economic instability detected in regional markets. Central banks convening emergency sessions.',
    'Seismic activity detected in the Pacific Ring of Fire. Tsunami warnings issued for coastal regions.',
    'Maritime confrontation escalating in the South China Sea. Multiple vessels in dangerous proximity.',
    'Humanitarian crisis deepening in North Africa. International response being coordinated.',
    'Intelligence indicates coordinated influence operations targeting democratic institutions.',
    'Supply chain disruptions spreading from East Asian manufacturing centers.',
    'Climate disaster emergency declared in South Asia. Mass evacuation operations underway.',
  ];

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = this.volume / 100;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.connect(this.masterGain);
    this.ambientGain.gain.value = 0.15;

    this.notificationGain = this.ctx.createGain();
    this.notificationGain.connect(this.masterGain);
    this.notificationGain.gain.value = 0.3;
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startAmbient();
    this.startRadar();
    this.startNarration();
  }

  stop() {
    this.isPlaying = false;
    this.stopAmbient();
    this.stopRadar();
    this.stopNarration();
  }

  private startAmbient() {
    if (!this.ctx || !this.ambientGain || !this.ambientEnabled) return;

    const createDrone = (freq: number, detune: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(this.ambientGain!);
      osc.start();
      this.oscillators.push(osc);
      return osc;
    };

    createDrone(55, 0);
    createDrone(55.5, 5);
    createDrone(82.5, -3);
    createDrone(110, 7);

    const noise = this.createNoise();
    const noiseGain = this.ctx.createGain();
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 200;
    noiseGain.gain.value = 0.04;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ambientGain!);
  }

  private createNoise(): AudioBufferSourceNode {
    const bufferSize = this.ctx!.sampleRate * 4;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();
    return source;
  }

  private stopAmbient() {
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    this.oscillators = [];
  }

  private startRadar() {
    if (!this.ctx || !this.notificationGain) return;
    this.radarInterval = setInterval(() => {
      if (!this.isPlaying || !this.notificationsEnabled) return;
      this.playRadarBlip();
    }, 4000 + Math.random() * 3000);
  }

  private stopRadar() {
    if (this.radarInterval) {
      clearInterval(this.radarInterval);
      this.radarInterval = null;
    }
  }

  private playRadarBlip() {
    if (!this.ctx || !this.notificationGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1800 + Math.random() * 400;
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.notificationGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  private startNarration() {
    if (!this.voiceEnabled) return;
    const intervals: Record<AudioMode, number> = {
      global_radio: 15000,
      focus: 25000,
      alert: 45000,
      night: 60000,
    };

    this.narrationInterval = setInterval(() => {
      if (!this.isPlaying || !this.voiceEnabled) return;
      const text = this.narrationTexts[Math.floor(Math.random() * this.narrationTexts.length)];
      this.speak(text);
      if (this.onNarration) this.onNarration(text);
    }, intervals[this.mode]);
  }

  private stopNarration() {
    if (this.narrationInterval) {
      clearInterval(this.narrationInterval);
      this.narrationInterval = null;
    }
  }

  speak(text: string) {
    if (!this.voiceEnabled || this.isMuted) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 0.85;
      utterance.volume = Math.min(1, this.volume / 100);
      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;
      speechSynthesis.speak(utterance);
    }
  }

  playNotification() {
    if (!this.ctx || !this.notificationsEnabled || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.notificationGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playAlert() {
    if (!this.ctx || !this.notificationsEnabled || this.isMuted) return;
    const now = this.ctx.currentTime;
    [0, 0.15, 0.3].forEach(offset => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.value = 600;
      gain.gain.setValueAtTime(0.15, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
      osc.connect(gain);
      gain.connect(this.notificationGain!);
      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }

  playBootSequence() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [220, 330, 440, 660];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.3);
    });
  }

  setMode(mode: AudioMode) {
    this.mode = mode;
    if (this.isPlaying) {
      this.stopNarration();
      this.startNarration();
    }
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.masterGain) {
      this.masterGain.gain.value = vol / 100;
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.volume / 100;
    }
  }

  setAmbientEnabled(enabled: boolean) {
    this.ambientEnabled = enabled;
    if (this.ambientGain) {
      this.ambientGain.gain.value = enabled ? 0.15 : 0;
    }
  }

  setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    if (!enabled) {
      speechSynthesis.cancel();
      this.stopNarration();
    } else if (this.isPlaying) {
      this.startNarration();
    }
  }

  setNotificationsEnabled(enabled: boolean) {
    this.notificationsEnabled = enabled;
  }

  onNarrationUpdate(callback: AudioCallback) {
    this.onNarration = callback;
  }

  getIsPlaying() { return this.isPlaying; }
  getMode() { return this.mode; }
  getVolume() { return this.volume; }
  getIsMuted() { return this.isMuted; }
  getAmbientEnabled() { return this.ambientEnabled; }
  getVoiceEnabled() { return this.voiceEnabled; }
  getNotificationsEnabled() { return this.notificationsEnabled; }
}

export const audioEngine = new AudioEngine();
