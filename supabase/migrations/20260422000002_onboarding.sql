-- Onboarding wizard support
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS monthly_income_estimate BIGINT;

COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user finished the welcome wizard';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'When the user finished onboarding';
COMMENT ON COLUMN profiles.monthly_income_estimate IS 'Rough monthly income provided during onboarding, used to suggest budgets';

-- Mark existing users as already onboarded so the wizard only targets new signups
UPDATE profiles SET onboarding_completed = true, onboarding_completed_at = NOW() WHERE onboarding_completed = false;
