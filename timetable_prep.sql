-- ============================================================
-- VIT DLR PORTAL — TIMETABLE PREP (Run BEFORE new timetable seed)
-- Clears old data and ensures schema columns/time-slots exist
-- ============================================================

-- ── STEP 1: Clear dependent data (FK-safe order) ─────────────
DELETE FROM public.attendance;
UPDATE public.lecture_records SET timetable_id = NULL WHERE timetable_id IS NOT NULL;
DELETE FROM public.lecture_records;
DELETE FROM public.timetable;
-- NOTE: students, divisions, subjects, rooms are cleared below
--       only if you want a full reset (comment out if not needed)
DELETE FROM public.students;
DELETE FROM public.divisions;
DELETE FROM public.subjects;
DELETE FROM public.rooms;

-- ── STEP 2: Ensure batch_number column exists on timetable ───
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS batch_number INTEGER;

-- ── STEP 3: Insert all time slots used in the new timetable ──
INSERT INTO public.time_slots (slot_label, start_time, end_time, slot_order) VALUES
  ('9:00 - 10:00',   '09:00', '10:00',  2),
  ('11:15 - 12:15',  '11:15', '12:15',  5),
  ('12:15 - 13:15',  '12:15', '13:15',  6),
  ('13:45 - 14:45',  '13:45', '14:45',  8),
  ('14:45 - 15:45',  '14:45', '15:45',  9),
  ('15:45 - 16:45',  '15:45', '16:45', 10),
  ('16:45 - 17:45',  '16:45', '17:45', 11)
ON CONFLICT (start_time, end_time) DO NOTHING;

-- ── Verify ───────────────────────────────────────────────────
SELECT slot_label, start_time, end_time FROM public.time_slots ORDER BY slot_order;
