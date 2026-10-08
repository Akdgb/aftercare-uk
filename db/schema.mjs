// AfterCare UK — Postgres schema.
// Idempotent (safe to run any number of times). Applied automatically when the
// app starts (instrumentation.ts) and by `npm run db:migrate`.
export const SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (created automatically on first sign-in)
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT UNIQUE NOT NULL,
  reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Magic link tokens (expire after 20 minutes, marked used after click)
CREATE TABLE IF NOT EXISTS magic_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS magic_links_email_created_idx ON magic_links (email, created_at);

-- Saved bereavement plans
CREATE TABLE IF NOT EXISTS saved_plans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  intake_data      JSONB NOT NULL,
  task_statuses    JSONB NOT NULL DEFAULT '{}',
  task_assignees   JSONB NOT NULL DEFAULT '{}',
  last_reminded_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE saved_plans ADD COLUMN IF NOT EXISTS task_assignees JSONB NOT NULL DEFAULT '{}';
ALTER TABLE saved_plans ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS saved_plans_user_id_idx ON saved_plans (user_id);

-- Family members invited to help with a plan (matched by email on sign-in)
CREATE TABLE IF NOT EXISTS plan_members (
  plan_id    UUID NOT NULL REFERENCES saved_plans(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (plan_id, email)
);

CREATE INDEX IF NOT EXISTS plan_members_email_idx ON plan_members (email);

-- Notes left on individual tasks by the owner or family members
CREATE TABLE IF NOT EXISTS task_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id      UUID NOT NULL REFERENCES saved_plans(id) ON DELETE CASCADE,
  task_id      TEXT NOT NULL,
  author_email TEXT NOT NULL,
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS task_comments_plan_idx ON task_comments (plan_id, created_at);

-- Row level security on every table. The app connects as the tables' owner,
-- which bypasses RLS, and checks access itself (lib/plan-access.ts). With no
-- policies, any other role (for example a database "data API" or a leaked
-- read-only login) can read nothing. Skipped quietly if this role cannot alter
-- a table, so startup never fails because of it.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users', 'magic_links', 'saved_plans', 'plan_members', 'task_comments'] LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE NOTICE 'Could not enable RLS on %', t;
    END;
  END LOOP;
END $$;
`;
