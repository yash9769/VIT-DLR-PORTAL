-- ============================================================
-- VIT DLR PORTAL — SAFE DATABASE CLEANUP
-- Removes mock data; leaves users referenced by timetable intact
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Clear all submitted DLR records ─────────────────────
DELETE FROM public.lecture_records;

-- ── 2. Clear all substitutions ─────────────────────────────
DELETE FROM public.substitutions;

-- ── 3. Remove placeholder faculty NOT referenced in timetable
--    (safe: won't violate FK constraint)
DELETE FROM public.users
WHERE (
  email LIKE 'placeholder_%'
  OR full_name LIKE '%Placeholder%'
  OR full_name LIKE '%TBD%'
)
AND id NOT IN (
  SELECT DISTINCT faculty_id FROM public.timetable WHERE faculty_id IS NOT NULL
);

-- ── 4. Mark remaining placeholders as inactive instead
--    (for those still referenced by timetable — cannot be deleted)
UPDATE public.users
SET is_active = false
WHERE (
  email LIKE 'placeholder_%'
  OR full_name LIKE '%Placeholder%'
  OR full_name LIKE '%TBD%'
)
AND id IN (
  SELECT DISTINCT faculty_id FROM public.timetable WHERE faculty_id IS NOT NULL
);

-- ── 5. Remove demo / non-VIT users from public.users
--    (only if NOT referenced by timetable, lecture_records, or substitutions)
DELETE FROM public.users
WHERE email NOT LIKE '%@vit.edu.in'
  AND role IN ('faculty')
  AND id NOT IN (
    SELECT DISTINCT faculty_id FROM public.timetable WHERE faculty_id IS NOT NULL
    UNION
    SELECT DISTINCT faculty_id FROM public.lecture_records WHERE faculty_id IS NOT NULL
  );

-- ── Verification ────────────────────────────────────────────
SELECT 'lecture_records' AS table_name, COUNT(*) AS row_count FROM public.lecture_records
UNION ALL
SELECT 'substitutions',  COUNT(*) FROM public.substitutions
UNION ALL
SELECT 'users (total)',  COUNT(*) FROM public.users
UNION ALL
SELECT 'users (active)', COUNT(*) FROM public.users WHERE is_active = true
UNION ALL
SELECT 'users (inactive/placeholder)', COUNT(*) FROM public.users WHERE is_active = false;

-- Show all remaining users
SELECT role, email, full_name, is_active,
  CASE WHEN id IN (SELECT DISTINCT faculty_id FROM public.timetable WHERE faculty_id IS NOT NULL)
       THEN 'Yes' ELSE 'No' END AS has_timetable
FROM public.users
ORDER BY role, full_name;
