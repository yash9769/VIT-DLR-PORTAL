-- ============================================================
-- VIT DLR PORTAL — TIMETABLE CLEAN SLATE
-- Deletes ONLY timetable entries.
-- Preserves: users, time_slots, rooms, subjects, divisions,
--            students, lecture_records, attendance.
-- ============================================================

BEGIN;

-- Null the FK in lecture_records so timetable rows can be deleted
UPDATE public.lecture_records SET timetable_id = NULL WHERE timetable_id IS NOT NULL;

-- Delete all timetable entries
DELETE FROM public.timetable;

COMMIT;

-- After running this, paste your updated timetable seed SQL
-- (the _tt() function + INSERT block) and run it separately.

-- Quick check: should return 0 rows
-- SELECT COUNT(*) FROM public.timetable;
