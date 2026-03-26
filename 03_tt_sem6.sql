-- ============================================================
-- BLOCK 3: SEMESTER 6 (Divisions A, B, C)
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

-- ================= DIVISION A (TE-A) =================
-- Monday
PERFORM _tt('INFT-6-A','Monday','11:15-12:15','FBET','ET2','M309',NULL);

-- Tuesday
PERFORM _tt('INFT-6-A','Tuesday','09:00-10:00','STQA','DSJ','L07C',1);
PERFORM _tt('INFT-6-A','Tuesday','09:00-10:00','SC','SM','L07A',2);
PERFORM _tt('INFT-6-A','Tuesday','09:00-10:00','PGM','DG','L07B',3);
PERFORM _tt('INFT-6-A','Tuesday','09:00-10:00','CC','KGD','L07E',4);
PERFORM _tt('INFT-6-A','Tuesday','11:15-12:15','CC','DG','E201',NULL);
PERFORM _tt('INFT-6-A','Tuesday','13:45-14:45','SC','SM','E201',NULL);

-- Wednesday
PERFORM _tt('INFT-6-A','Wednesday','09:00-10:00','PGM','NKR','E201',NULL);
PERFORM _tt('INFT-6-A','Wednesday','11:15-12:15','DEVOPS LAB','DST','L07C',1);
PERFORM _tt('INFT-6-A','Wednesday','11:15-12:15','PROJECT-1','IT1','E201',2);
PERFORM _tt('INFT-6-A','Wednesday','11:15-12:15','SC','SM','L07A',3);
PERFORM _tt('INFT-6-A','Wednesday','11:15-12:15','PGM','DG','L07B',4);
PERFORM _tt('INFT-6-A','Wednesday','13:45-14:45','SCD','AVL','E201',NULL);

-- Thursday
PERFORM _tt('INFT-6-A','Thursday','09:00-10:00','AT','NKR','E101',NULL);
PERFORM _tt('INFT-6-A','Thursday','11:15-12:15','STQA','DSJ','E201',NULL);
PERFORM _tt('INFT-6-A','Thursday','11:15-12:15','STQA','DSJ','E201',NULL, TRUE);
PERFORM _tt('INFT-6-A','Thursday','13:45-14:45','SC','SM','L07B',1);
PERFORM _tt('INFT-6-A','Thursday','13:45-14:45','PGM','DG','L07A',2);
PERFORM _tt('INFT-6-A','Thursday','13:45-14:45','PROJECT-1','IT1','E201',3);
PERFORM _tt('INFT-6-A','Thursday','13:45-14:45','DEVOPS LAB','DST','CC02',4);

-- Friday
PERFORM _tt('INFT-6-A','Friday','09:00-10:00','PGM','DG','L07A',1);
PERFORM _tt('INFT-6-A','Friday','09:00-10:00','STQA','DSJ','L07C',2);
PERFORM _tt('INFT-6-A','Friday','09:00-10:00','DEVOPS LAB','DST','CC02',3);
PERFORM _tt('INFT-6-A','Friday','09:00-10:00','PROJECT-1','IT1','E101',4);
PERFORM _tt('INFT-6-A','Friday','11:15-12:15','STQA','DSJ','E201',NULL);
PERFORM _tt('INFT-6-A','Friday','13:45-14:45','CC','DG','E201',NULL);

-- ================= DIVISION B (TE-B) =================
-- Monday
PERFORM _tt('INFT-6-B','Monday','11:15-12:15','FBET','ET2','M309',NULL);
PERFORM _tt('INFT-6-B','Monday','13:45-14:45','STQA','DSJ','L07C',1);
PERFORM _tt('INFT-6-B','Monday','13:45-14:45','SC','SM','L07A',2);
PERFORM _tt('INFT-6-B','Monday','13:45-14:45','PGM','DG','L07B',3);
PERFORM _tt('INFT-6-B','Monday','13:45-14:45','CC','KGD','L07E',4);

-- Tuesday
PERFORM _tt('INFT-6-B','Tuesday','09:00-10:00','CC','DG','E301',NULL);
PERFORM _tt('INFT-6-B','Tuesday','11:15-12:15','SC','SM','E301',NULL);
PERFORM _tt('INFT-6-B','Tuesday','13:45-14:45','PGM','DG','L07A',1);
PERFORM _tt('INFT-6-B','Tuesday','13:45-14:45','STQA','DSJ','L07C',2);
PERFORM _tt('INFT-6-B','Tuesday','13:45-14:45','DEVOPS LAB','DST','L07B',3);
PERFORM _tt('INFT-6-B','Tuesday','13:45-14:45','PROJECT-1','IT1','L07E',4);

-- Wednesday
PERFORM _tt('INFT-6-B','Wednesday','09:00-10:00','AT','NKR','E301',NULL);
PERFORM _tt('INFT-6-B','Wednesday','11:15-12:15','CC','DG','E301',NULL);
PERFORM _tt('INFT-6-B','Wednesday','13:45-14:45','SCD','AVL','E301',NULL);

-- Thursday
PERFORM _tt('INFT-6-B','Thursday','09:00-10:00','SCD','AVL','E301',NULL);
PERFORM _tt('INFT-6-B','Thursday','11:15-12:15','STQA','DSJ','E301',NULL);
PERFORM _tt('INFT-6-B','Thursday','13:45-14:45','DEVOPS LAB','DST','L07C',1);
PERFORM _tt('INFT-6-B','Thursday','13:45-14:45','PROJECT-1','IT1','E101',2);
PERFORM _tt('INFT-6-B','Thursday','13:45-14:45','SC','SM','L07A',3);
PERFORM _tt('INFT-6-B','Thursday','13:45-14:45','PGM','DG','L07B',4);

-- Friday
PERFORM _tt('INFT-6-B','Friday','09:00-10:00','SC','SM','L07B',1);
PERFORM _tt('INFT-6-B','Friday','09:00-10:00','PGM','DG','L07A',2);
PERFORM _tt('INFT-6-B','Friday','09:00-10:00','PROJECT-1','IT1','E303',3);
PERFORM _tt('INFT-6-B','Friday','09:00-10:00','DEVOPS LAB','DST','L07C',4);
PERFORM _tt('INFT-6-B','Friday','11:15-12:15','SC','SM','E301',NULL);
PERFORM _tt('INFT-6-B','Friday','13:45-14:45','STQA','DSJ','E301',NULL);

-- ================= DIVISION C (TE-C) =================
-- Monday
PERFORM _tt('INFT-6-C','Monday','09:00-10:00','DEVOPS LAB','DST','CC02',1);
PERFORM _tt('INFT-6-C','Monday','09:00-10:00','PROJECT-1','IT1','E303',2);
PERFORM _tt('INFT-6-C','Monday','09:00-10:00','SC','SM','L07A',3);
PERFORM _tt('INFT-6-C','Monday','09:00-10:00','PGM','DG','L07B',4);
PERFORM _tt('INFT-6-C','Monday','11:15-12:15','FBET','ET2','E204',NULL);

-- Tuesday
PERFORM _tt('INFT-6-C','Tuesday','09:00-10:00','CC','DG','E303',NULL);
PERFORM _tt('INFT-6-C','Tuesday','11:15-12:15','SC','SM','E303',NULL);
PERFORM _tt('INFT-6-C','Tuesday','13:45-14:45','STQA','DSJ','L07C',1);
PERFORM _tt('INFT-6-C','Tuesday','13:45-14:45','SC','SM','L07A',2);
PERFORM _tt('INFT-6-C','Tuesday','13:45-14:45','PGM','DG','L07B',3);
PERFORM _tt('INFT-6-C','Tuesday','13:45-14:45','CC','KGD','L11B',4);

-- Wednesday
PERFORM _tt('INFT-6-C','Wednesday','11:15-12:15','PGM','NKR','E303',NULL);
PERFORM _tt('INFT-6-C','Wednesday','13:45-14:45','SCD','AVL','E303',NULL);

-- Thursday
PERFORM _tt('INFT-6-C','Thursday','09:00-10:00','AT','NKR','E303',NULL);
PERFORM _tt('INFT-6-C','Thursday','11:15-12:15','STQA','DSJ','E303',NULL);
PERFORM _tt('INFT-6-C','Thursday','13:45-14:45','PGM','DG','L07C',1);
PERFORM _tt('INFT-6-C','Thursday','13:45-14:45','STQA','DSJ','L11B',2);
PERFORM _tt('INFT-6-C','Thursday','13:45-14:45','DEVOPS LAB','DST','CC02',3);
PERFORM _tt('INFT-6-C','Thursday','13:45-14:45','PROJECT-1','IT1','E303',4);

-- Friday
PERFORM _tt('INFT-6-C','Friday','09:00-10:00','CC','DG','E303',NULL);
PERFORM _tt('INFT-6-C','Friday','11:15-12:15','SCD','AVL','E303',NULL);
PERFORM _tt('INFT-6-C','Friday','13:45-14:45','SC','SM','L07A',1);
PERFORM _tt('INFT-6-C','Friday','13:45-14:45','PGM','DG','L11B',2);
PERFORM _tt('INFT-6-C','Friday','13:45-14:45','PROJECT-1','IT1','E303',3);
PERFORM _tt('INFT-6-C','Friday','13:45-14:45','DEVOPS LAB','DST','CC02',4);

END $$;
DROP FUNCTION IF EXISTS _tt(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,INT,BOOLEAN);
COMMIT;
