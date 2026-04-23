-- Persist per-chat conversational state for the Telegram bot.
-- Previously stored in an in-memory Map in `conversationMemory.ts`, which
-- does not survive serverless invocations on Vercel. Losing this state
-- meant shortcuts like "subir todo junto" after a receipt upload fell
-- through to `handleFreeConversation`, producing hallucinated confirmations
-- without actually inserting the transaction.
CREATE TABLE IF NOT EXISTS telegram_conversations (
  chat_id BIGINT PRIMARY KEY,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  pending_data JSONB,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes')
);

CREATE INDEX IF NOT EXISTS idx_telegram_conversations_expires
  ON telegram_conversations(expires_at);

-- Only the service-role webhook touches this table.
ALTER TABLE telegram_conversations ENABLE ROW LEVEL SECURITY;

-- Expired rows are filtered at read time in conversationMemory.ts, so no
-- cron cleanup is strictly required. If `pg_cron` gets enabled later,
-- schedule `SELECT cleanup_expired_telegram_conversations()` every minute.
CREATE OR REPLACE FUNCTION cleanup_expired_telegram_conversations()
RETURNS void AS $$
BEGIN
  DELETE FROM telegram_conversations WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
