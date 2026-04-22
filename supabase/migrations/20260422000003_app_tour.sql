-- App tour completion tracking
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS app_tour_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS app_tour_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.app_tour_completed IS 'Whether user finished the post-onboarding guided tour';
COMMENT ON COLUMN profiles.app_tour_completed_at IS 'When the user finished the app tour';

-- Existing users already know the app, mark them as tour-completed
UPDATE profiles SET app_tour_completed = true, app_tour_completed_at = NOW() WHERE app_tour_completed = false;
