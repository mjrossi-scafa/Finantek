-- Create table for bot pending actions (confirmations, multi-step flows)
CREATE TABLE IF NOT EXISTS bot_pending_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_chat_id BIGINT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_pending_actions_chat_id ON bot_pending_actions(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_pending_actions_expires ON bot_pending_actions(expires_at);
CREATE INDEX IF NOT EXISTS idx_pending_actions_user ON bot_pending_actions(user_id);

-- Auto-delete expired actions
CREATE OR REPLACE FUNCTION cleanup_expired_bot_actions()
RETURNS void AS $$
BEGIN
  DELETE FROM bot_pending_actions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup every minute
SELECT cron.schedule('cleanup-bot-actions', '*/1 * * * *', 'SELECT cleanup_expired_bot_actions();');