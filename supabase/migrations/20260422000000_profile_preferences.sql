-- Add user preferences columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Santiago',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
    "notifications": {
      "budget_alerts": true,
      "weekly_insights": true,
      "daily_reminders": true
    },
    "reminder_hour": 21
  }'::jsonb;

COMMENT ON COLUMN profiles.preferences IS 'User preferences: notifications toggles, reminder schedules, etc.';
COMMENT ON COLUMN profiles.timezone IS 'IANA timezone name for date calculations';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user avatar image';
