-- AfterCare UK — Supabase Schema

-- Saved plans (no auth required — identified by UUID link)
CREATE TABLE IF NOT EXISTS public.saved_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  intake_data JSONB NOT NULL,
  task_statuses JSONB NOT NULL DEFAULT '{}',
  want_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS on saved_plans — access is controlled by knowing the UUID
-- The UUID is unguessable (122 bits of entropy)

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  postcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cases (one per bereavement)
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  deceased_name TEXT NOT NULL,
  date_of_death DATE,
  location_of_death TEXT,
  current_location TEXT CHECK (current_location IN ('hospital', 'hospice', 'care-home', 'home', 'funeral-director')),
  relationship TEXT,
  postcode TEXT,
  funeral_preference TEXT CHECK (funeral_preference IN ('burial', 'cremation', 'unsure')),
  faith TEXT,
  housing_type TEXT,
  receiving_benefits TEXT CHECK (receiving_benefits IN ('yes', 'no', 'unsure')),
  needs_financial_help TEXT CHECK (needs_financial_help IN ('yes', 'no', 'unsure')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('immediate', 'legal', 'financial', 'government', 'housing', 'personal')),
  priority TEXT CHECK (priority IN ('urgent', 'this-week', 'this-month', 'future')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  assigned_to UUID REFERENCES public.users(id),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family members
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'Family member',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task comments
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id),
  author_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI conversations
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources (local providers cache)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  postcode TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users can view own cases" ON public.cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases" ON public.cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases" ON public.cases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view tasks in their cases" ON public.tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = tasks.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "Users can manage tasks in their cases" ON public.tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = tasks.case_id AND cases.user_id = auth.uid())
  );
