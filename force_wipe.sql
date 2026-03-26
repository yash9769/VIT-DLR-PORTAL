-- ============================================================
-- VIT DLR PORTAL — SAFE TIMETABLE ONLY WIPE SCRIPT
-- RUN THIS TO REMOVE *ONLY* THE TIMETABLE DATA
-- (Rooms, Subjects, Divisions, Students remain untouched)
-- ============================================================

BEGIN;

-- 1. Remove Substitutions (They depend strictly on Timetable entries)
DELETE FROM public.substitutions;

-- 2. Unlink Lecture Records from the Timetable (so they aren't deleted, just unlinked)
UPDATE public.lecture_records SET timetable_id = NULL;

-- 3. Delete the actual Timetable entries safely
DELETE FROM public.timetable;

-- 4. Delete old Time Slots so you can add the correct 9-slot ones
DELETE FROM public.time_slots;

COMMIT;
