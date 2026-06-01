-- AfterCare UK — Vercel Postgres Schema
-- Run this once in: Vercel Dashboard → Storage → your DB → Query

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS saved_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,          -- Clerk user ID (user_xxxxxxxx)
  intake_data JSONB NOT NULL,
  task_statuses JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_plans_user_id_idx ON saved_plans (user_id);
