-- AfterCare UK — Vercel Postgres Schema
-- Run once in: Vercel Dashboard → Storage → your DB → Query tab

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (created automatically on first sign-in)
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Magic link tokens (expire after 20 minutes, marked used after click)
CREATE TABLE IF NOT EXISTS magic_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved bereavement plans
CREATE TABLE IF NOT EXISTS saved_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  intake_data   JSONB NOT NULL,
  task_statuses JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_plans_user_id_idx ON saved_plans (user_id);
