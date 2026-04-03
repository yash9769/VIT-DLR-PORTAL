-- ═══════════════════════════════════════════════════════════
-- FIX: RLS policies for proxy lecture visibility + notifications
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════


-- ── 1. TIMETABLE: Allow proxy faculty to read covered lecture entries ──────
--
-- Problem: "Faculty can view own timetable" only allows faculty_id = auth.uid()
-- So when proxy faculty fetches the absent faculty's timetable entry by ID,
-- RLS blocks it → subTimetableMap is empty → "Proxy record missing timetable data"
--
-- Fix: Add a policy that lets any authenticated user read a timetable entry
-- when they are assigned as a proxy for that entry today.
-- (This ORs with the existing policy — no data is lost.)

DROP POLICY IF EXISTS "Proxy faculty can view assigned timetable" ON public.timetable;

CREATE POLICY "Proxy faculty can view assigned timetable"
  ON public.timetable
  FOR SELECT
  USING (
    -- Any faculty can read a timetable entry where they are an active proxy today
    EXISTS (
      SELECT 1 FROM public.substitutions s
      WHERE s.timetable_id = timetable.id
        AND s.proxy_faculty_id = auth.uid()
        AND s.status = 'active'
    )
  );


-- ── 2. NOTIFICATIONS: Allow faculty to send notifications to others ────────
--
-- Problem: Current policy is FOR ALL USING (user_id = auth.uid())
-- Sending a notification to the proxy faculty means inserting a row
-- where user_id = proxy_faculty_id ≠ auth.uid() → 403 Forbidden
--
-- Fix: Split the policy — SELECT/UPDATE only for own notifications,
-- INSERT allowed for any authenticated user (to notify others).

-- Drop the old combined policy
DROP POLICY IF EXISTS "Users see own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can send notifications" ON public.notifications;

-- SELECT: users can only read their own notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- INSERT: any authenticated user can create a notification for any user
-- (needed for faculty to notify proxy faculty of assignment)
CREATE POLICY "Authenticated users can send notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: users can only update (mark read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: users can only delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (user_id = auth.uid());
