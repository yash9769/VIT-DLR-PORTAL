-- ============================================================
-- BLOCK 4: SEMESTER 8 (Divisions A, B)
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION _tt(p_div TEXT, p_day TEXT, p_time TEXT, p_sub TEXT, p_fac TEXT, p_room TEXT, p_batch INT, p_ditto BOOLEAN DEFAULT FALSE) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE v_div UUID; v_sub UUID; v_fac UUID; v_rm UUID; v_ts UUID;
  v_start TIME := CASE 
    WHEN p_time LIKE '15:45%' OR p_time LIKE '16:00%' THEN '16:00:00'::TIME 
    WHEN p_time LIKE '16:45%' OR p_time LIKE '17:00%' THEN '17:00:00'::TIME 
    ELSE SPLIT_PART(p_time, '-', 1)::TIME END;
BEGIN
  SELECT id INTO v_div FROM public.divisions WHERE division_name = p_div;
  SELECT id INTO v_sub FROM public.subjects  WHERE short_name = p_sub;
  SELECT id INTO v_fac FROM public.users     WHERE initials = p_fac;
  SELECT id INTO v_rm  FROM public.rooms     WHERE room_number = p_room;
  SELECT id INTO v_ts  FROM public.time_slots WHERE start_time = v_start;
  IF v_div IS NOT NULL AND v_sub IS NOT NULL AND v_ts IS NOT NULL THEN
    INSERT INTO public.timetable (faculty_id, division_id, subject_id, room_id, time_slot_id, day_of_week, batch_no, is_ditto)
    VALUES (v_fac, v_div, v_sub, v_rm, v_ts, p_day::day_of_week, p_batch, p_ditto);
  END IF; END; $$;

DO $$ BEGIN

-- ================= DIVISION A (BE-A) =================
-- Monday
PERFORM _tt('INFT-8-A','Monday','09:00-10:00','UI/UX','SDG','E204',NULL);
PERFORM _tt('INFT-8-A','Monday','10:00-11:00','UI/UX','SDG','E204',NULL, TRUE);
PERFORM _tt('INFT-8-A','Monday','11:15-12:15','NG-AIML','DG','E303',NULL);
PERFORM _tt('INFT-8-A','Monday','12:15-13:15','NG-AIML','DG','E303',NULL, TRUE);
PERFORM _tt('INFT-8-A','Monday','13:45-14:45','UI/UX','SDG','E204',NULL);
PERFORM _tt('INFT-8-A','Monday','15:45-16:45','NG-AIML','DG','L07A',NULL);

-- Tuesday
PERFORM _tt('INFT-8-A','Tuesday','09:00-10:00','PROJECT-2','IT3',NULL,NULL);
PERFORM _tt('INFT-8-A','Tuesday','10:00-11:00','PROJECT-2','IT3',NULL,NULL, TRUE);
PERFORM _tt('INFT-8-A','Tuesday','11:15-12:15','PROJECT-2','IT3',NULL,NULL);
PERFORM _tt('INFT-8-A','Tuesday','12:15-13:15','PROJECT-2','IT3',NULL,NULL, TRUE);

-- Wednesday
PERFORM _tt('INFT-8-A','Wednesday','09:00-10:00','PROJECT-2','IT3',NULL,NULL);
PERFORM _tt('INFT-8-A','Wednesday','11:15-12:15','PROJECT-2','IT3',NULL,NULL);

-- Thursday
PERFORM _tt('INFT-8-A','Thursday','13:45-14:45','PROJECT-2','IT1',NULL,NULL);
PERFORM _tt('INFT-8-A','Thursday','15:45-16:45','PROJECT-2','IT1',NULL,NULL);

-- Friday
PERFORM _tt('INFT-8-A','Friday','09:00-10:00','UI/UX','SDG','E204',NULL);
PERFORM _tt('INFT-8-A','Friday','11:15-12:15','NG-AIML','DG','E303',NULL);

-- ================= DIVISION B (BE-B) =================
-- Monday
PERFORM _tt('INFT-8-B','Monday','09:00-10:00','UI/UX','SDG','CC02',NULL);
PERFORM _tt('INFT-8-B','Monday','10:00-11:00','UI/UX','SDG','CC02',NULL, TRUE);
PERFORM _tt('INFT-8-B','Monday','11:15-12:15','NG-AIML','DG','L07A',NULL);
PERFORM _tt('INFT-8-B','Monday','12:15-13:15','NG-AIML','DG','L07A',NULL, TRUE);

-- Tuesday
PERFORM _tt('INFT-8-B','Tuesday','09:00-10:00','PROJECT-2','IT3',NULL,NULL);
PERFORM _tt('INFT-8-B','Tuesday','11:15-12:15','PROJECT-2','IT3',NULL,NULL);

-- Wednesday
PERFORM _tt('INFT-8-B','Wednesday','09:00-10:00','BI','SAM','M302',NULL);
PERFORM _tt('INFT-8-B','Wednesday','11:15-12:15','BI','SAM','M302',NULL);

-- Thursday
PERFORM _tt('INFT-8-B','Thursday','15:45-16:45','PROJECT-2','IT1',NULL,NULL);

END $$;
DROP FUNCTION IF EXISTS _tt(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,INT,BOOLEAN);
COMMIT;
