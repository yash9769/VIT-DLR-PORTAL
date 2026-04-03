-- ═══════════════════════════════════════════════════════════
-- FIX: RLS timezone mismatch on substitutions table
--
-- Problem: The faculty INSERT policy checks `substitution_date = CURRENT_DATE`
-- where CURRENT_DATE is in UTC. But the app runs in IST (UTC+5:30).
-- At 12:01 AM–5:30 AM IST, the app sends tomorrow's date (IST) but
-- Postgres still thinks it's yesterday (UTC) → 42501 permission denied.
--
-- Fix: Replace the date check with a ±1 day window, OR use IST timezone.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query).
-- ═══════════════════════════════════════════════════════════

-- Step 1: Drop the old restrictive INSERT policy
DROP POLICY IF EXISTS "faculty_insert_substitutions" ON public.substitutions;

-- Step 2: Replace with a timezone-aware policy
-- Allows faculty to insert substitutions for today in IST (Asia/Kolkata = UTC+5:30)
-- Security is still enforced: absent_faculty_id must be the logged-in user
CREATE POLICY "faculty_insert_substitutions"
  ON public.substitutions FOR INSERT
  WITH CHECK (
    absent_faculty_id = auth.uid()
    AND substitution_date BETWEEN
      (NOW() AT TIME ZONE 'Asia/Kolkata')::date - INTERVAL '1 day'
      AND (NOW() AT TIME ZONE 'Asia/Kolkata')::date + INTERVAL '1 day'
  );
