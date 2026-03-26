-- ============================================================
-- VIT DLR PORTAL — 9-SLOT TIME GRID SEED
-- RUN THIS FIRST TO ESTABLISH YOUR TIMETABLE GRID
-- ============================================================

BEGIN;

-- 1. Ensure time slots are completely clear before inserting fresh ones
DELETE FROM public.time_slots;

-- 2. Insert the flawless 9-slot grid 
INSERT INTO public.time_slots (slot_label, start_time, end_time, slot_order) VALUES
  ('08:00 - 09:00', '08:00:00', '09:00:00', 1),
  ('09:00 - 10:00', '09:00:00', '10:00:00', 2),
  ('10:00 - 11:00', '10:00:00', '11:00:00', 3),
  ('11:15 - 12:15', '11:15:00', '12:15:00', 4),
  ('12:15 - 13:15', '12:15:00', '13:15:00', 5),
  ('13:45 - 14:45', '13:45:00', '14:45:00', 6),
  ('14:45 - 15:45', '14:45:00', '15:45:00', 7),
  ('16:00 - 17:00', '16:00:00', '17:00:00', 8),
  ('17:00 - 18:00', '17:00:00', '18:00:00', 9);

-- 3. Also, let's rename the column inside this script just so your massive script doesn't fail!
ALTER TABLE public.timetable RENAME COLUMN batch_number TO batch_no;

COMMIT;
