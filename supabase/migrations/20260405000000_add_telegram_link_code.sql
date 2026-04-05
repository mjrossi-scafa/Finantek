-- Add telegram linking code fields to profiles table
ALTER TABLE profiles
ADD COLUMN telegram_link_code VARCHAR(6),
ADD COLUMN telegram_link_expires_at TIMESTAMPTZ;