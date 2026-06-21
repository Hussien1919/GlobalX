/*
  # GLOBALX - Global Intelligence Platform Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `display_name` (text)
      - `membership_tier` (text, default 'free')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `watchlist_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text) - country, region, sector, event
      - `name` (text)
      - `code` (text) - ISO country code or identifier
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
    - `alerts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `severity` (text) - critical, high, medium, low
      - `category` (text) - conflict, cyber, economic, disaster, political
      - `title` (text)
      - `description` (text)
      - `region` (text)
      - `country_code` (text)
      - `is_read` (boolean, default false)
      - `created_at` (timestamptz)
    - `audio_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `mode` (text, default 'global_radio') - global_radio, focus, alert, night
      - `volume` (integer, default 70)
      - `is_muted` (boolean, default false)
      - `ambient_enabled` (boolean, default true)
      - `voice_enabled` (boolean, default true)
      - `notifications_enabled` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Profiles linked to auth.users via id
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  display_name text NOT NULL DEFAULT '',
  membership_tier text NOT NULL DEFAULT 'free' CHECK (membership_tier IN ('free', 'pro')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS watchlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'country' CHECK (type IN ('country', 'region', 'sector', 'event')),
  name text NOT NULL,
  code text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own watchlist"
  ON watchlist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist items"
  ON watchlist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist items"
  ON watchlist_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist items"
  ON watchlist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  category text NOT NULL DEFAULT 'political' CHECK (category IN ('conflict', 'cyber', 'economic', 'disaster', 'political')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  country_code text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS audio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'global_radio' CHECK (mode IN ('global_radio', 'focus', 'alert', 'night')),
  volume integer NOT NULL DEFAULT 70 CHECK (volume >= 0 AND volume <= 100),
  is_muted boolean NOT NULL DEFAULT false,
  ambient_enabled boolean NOT NULL DEFAULT true,
  voice_enabled boolean NOT NULL DEFAULT true,
  notifications_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE audio_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own audio settings"
  ON audio_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audio settings"
  ON audio_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audio settings"
  ON audio_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON alerts(user_id, is_read) WHERE is_read = false;
