export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Category = 'conflict' | 'cyber' | 'economic' | 'disaster' | 'political';
export type AudioMode = 'global_radio' | 'focus' | 'alert' | 'night';
export type WatchlistType = 'country' | 'region' | 'sector' | 'event';
export type MembershipTier = 'free' | 'pro';

export interface GlobalEvent {
  id: string;
  type: Category;
  severity: Severity;
  title: string;
  description: string;
  lat: number;
  lng: number;
  country: string;
  countryCode: string;
  region: string;
  timestamp: Date;
  casualties?: number;
  impact?: string;
  sources?: string[];
  imageUrl?: string;
}

export interface CountryIntel {
  code: string;
  name: string;
  lat: number;
  lng: number;
  threatLevel: Severity;
  stability: number;
  economyScore: number;
  conflictRisk: number;
  cyberActivity: number;
  summary: string;
  recentEvents: GlobalEvent[];
  indicators: {
    label: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

export interface AlertItem {
  id: string;
  severity: Severity;
  category: Category;
  title: string;
  description: string;
  region: string;
  countryCode: string;
  isRead: boolean;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  type: WatchlistType;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface AudioSettings {
  mode: AudioMode;
  volume: number;
  isMuted: boolean;
  ambientEnabled: boolean;
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}
