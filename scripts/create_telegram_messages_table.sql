-- ============================================================
-- Telegram Messages Table
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS telegram_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id     BIGINT NOT NULL,
  from_name   TEXT,
  message     TEXT NOT NULL,
  direction   TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sent        BOOLEAN NOT NULL DEFAULT FALSE,   -- for outbound: has it been sent to Telegram yet?
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficiently fetching unsent outbound messages
CREATE INDEX IF NOT EXISTS idx_telegram_messages_outbound_unsent
  ON telegram_messages (direction, sent, created_at)
  WHERE direction = 'outbound' AND sent = FALSE;

-- Index for browsing messages by chat
CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat_id
  ON telegram_messages (chat_id, created_at DESC);

-- Row Level Security
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;

-- Only the service role (used by API routes) can read/write messages
-- No public access
CREATE POLICY "Service role only" ON telegram_messages
  USING (FALSE);  -- deny all by default; service role bypasses RLS

COMMENT ON TABLE telegram_messages IS
  'Stores Telegram messages between Josh and the Vercel webhook relay. 
   Inbound = messages from Josh''s phone. 
   Outbound = messages queued by Cowork/Antigravity to send back to Josh.';
