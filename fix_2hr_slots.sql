
-- SQL MIGRATION: Convert all time slots to 2-hour durations
-- Standard Slots: 
-- 1. 09:00 - 11:00
-- 2. 11:15 - 13:15
-- 3. 13:45 - 15:45
-- 4. 15:45 - 17:45

BEGIN;

-- 1. Create the new 4 slots if they don't exist
INSERT INTO public.time_slots (slot_label, start_time, end_time, slot_order) VALUES
  ('09:00 - 11:00', '09:00', '11:00', 1),
  ('11:15 - 13:15', '11:15', '13:15', 2),
  ('13:45 - 15:45', '13:45', '15:45', 3),
  ('15:45 - 17:45', '15:45', '17:45', 4)
ON CONFLICT (start_time, end_time) DO UPDATE SET slot_label = EXCLUDED.slot_label, slot_order = EXCLUDED.slot_order;

-- 2. Map existing timetable entries to the closest new 2-hour slot
-- Slot A (9-11): Catch anything starting between 8:00 and 10:30
UPDATE public.timetable
SET time_slot_id = (SELECT id FROM public.time_slots WHERE start_time = '09:00' LIMIT 1)
WHERE time_slot_id IN (SELECT id FROM public.time_slots WHERE start_time >= '08:00' AND start_time < '10:30' AND start_time != '09:00');

-- Slot B (11:15-13:15): Catch 10:30 to 12:30
UPDATE public.timetable
SET time_slot_id = (SELECT id FROM public.time_slots WHERE start_time = '11:15' LIMIT 1)
WHERE time_slot_id IN (SELECT id FROM public.time_slots WHERE start_time >= '10:30' AND start_time < '12:30' AND start_time != '11:15');

-- Slot C (13:45-15:45): Catch 12:30 to 15:00
UPDATE public.timetable
SET time_slot_id = (SELECT id FROM public.time_slots WHERE start_time = '13:45' LIMIT 1)
WHERE time_slot_id IN (SELECT id FROM public.time_slots WHERE start_time >= '12:30' AND start_time < '15:00' AND start_time != '13:45');

-- Slot D (15:45-17:45): Catch 15:00 to 18:00
UPDATE public.timetable
SET time_slot_id = (SELECT id FROM public.time_slots WHERE start_time = '15:45' LIMIT 1)
WHERE time_slot_id IN (SELECT id FROM public.time_slots WHERE start_time >= '15:00' AND start_time < '18:00' AND start_time != '15:45');

-- 3. Cleanup: Delete unused 1-hour slots
-- WARNING: Only delete if no other table (like lecture_records) references them by ID.
-- If lecture_records uses them, it's safer to keep them but hide them from the picker.
-- For now, let's just make them inactive (if we had an is_active column) or just leave them.
-- User said "make every slot 2 hrs", so I'll assume we should eventually delete.

COMMIT;
