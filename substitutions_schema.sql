-- ═══════════════════════════════════════════════════════════
-- SUBSTITUTIONS TABLE + RLS POLICIES
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Create the substitutions table
CREATE TABLE IF NOT EXISTS public.substitutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  substitution_date DATE NOT NULL,
  absent_faculty_id UUID NOT NULL REFERENCES public.users(id),
  proxy_faculty_id UUID NOT NULL REFERENCES public.users(id),
  timetable_id UUID NOT NULL REFERENCES public.timetable(id),
  reason TEXT DEFAULT 'Faculty Absent',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled')),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(substitution_date, absent_faculty_id, timetable_id)
);

-- 2. Add substitution_ref_id column to lecture_records (if not exists)
ALTER TABLE public.lecture_records
  ADD COLUMN IF NOT EXISTS substitution_ref_id UUID REFERENCES public.substitutions(id);

-- 3. Enable RLS
ALTER TABLE public.substitutions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Faculty: SELECT rows where they are absent or proxy
CREATE POLICY "faculty_select_substitutions"
  ON public.substitutions FOR SELECT
  USING (
    absent_faculty_id = auth.uid()
    OR proxy_faculty_id = auth.uid()
  );

-- Faculty: INSERT only for themselves as absent faculty, only for today
CREATE POLICY "faculty_insert_substitutions"
  ON public.substitutions FOR INSERT
  WITH CHECK (
    absent_faculty_id = auth.uid()
    AND substitution_date = CURRENT_DATE
  );

-- Admin/HOD: Full access
CREATE POLICY "admin_full_access_substitutions"
  ON public.substitutions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin', 'hod')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin', 'hod')
    )
  );

-- Faculty UPDATE (to cancel their own substitutions)
CREATE POLICY "faculty_update_own_substitutions"
  ON public.substitutions FOR UPDATE
  USING (absent_faculty_id = auth.uid())
  WITH CHECK (absent_faculty_id = auth.uid());
