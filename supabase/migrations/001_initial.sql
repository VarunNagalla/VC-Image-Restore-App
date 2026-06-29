-- VC Image Restore — Initial Schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS sessions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name     text        NOT NULL,
  device_type   text        NOT NULL CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  features_used text[]      NOT NULL DEFAULT '{}',
  image_count   integer     NOT NULL CHECK (image_count > 0),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key        text        PRIMARY KEY,
  value      text        NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('bg_color',       '#0f0f0f'),
  ('hero_title',     'Restore Your Memories'),
  ('hero_subtitle',  'AI-powered photo restoration. Denoise, sharpen, colorize, and enhance old photos in seconds.'),
  ('cta_text',       'Start Restoring'),
  ('cta_color',      '#6366f1'),
  ('footer_text',    '© Varun Nagalla. All rights reserved.'),
  ('logo_url',       '')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS login_attempts (
  ip_address    text        PRIMARY KEY,
  attempt_count integer     NOT NULL DEFAULT 1,
  locked_until  timestamptz,
  last_attempt  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  feature_name  text        PRIMARY KEY,
  enabled       boolean     NOT NULL DEFAULT true,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

INSERT INTO feature_flags (feature_name, enabled) VALUES
  ('denoise',          true),
  ('sharpen',          true),
  ('scratch_cleanup',  true),
  ('color_correction', true),
  ('face_enhancement', true),
  ('colorization',     true),
  ('upscale_2x',       true),
  ('upscale_4x',       true)
ON CONFLICT (feature_name) DO NOTHING;

ALTER TABLE site_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "public read feature_flags" ON feature_flags FOR SELECT USING (true);
