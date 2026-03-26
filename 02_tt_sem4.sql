-- ============================================================
-- BLOCK 2: SEMESTER 4 (Divisions A, B, C)
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

-- ================= DIVISION A (SE-A) =================
-- Monday
PERFORM _tt('INFT-4-A','Monday','09:00-10:00','TEST','TEST',NULL,NULL);
PERFORM _tt('INFT-4-A','Monday','10:00-11:00','TEST','TEST',NULL,NULL, TRUE);
PERFORM _tt('INFT-4-A','Monday','11:15-12:15','ADSBI','AVL','E201',1);
PERFORM _tt('INFT-4-A','Monday','11:15-12:15','SPD','EX1','F102',2);
PERFORM _tt('INFT-4-A','Monday','11:15-12:15','MVRP','GN','B301',3);
PERFORM _tt('INFT-4-A','Monday','12:15-13:15','ADSBI','AVL','E201',1, TRUE);
PERFORM _tt('INFT-4-A','Monday','12:15-13:15','SPD','EX1','F102',2, TRUE);
PERFORM _tt('INFT-4-A','Monday','12:15-13:15','MVRP','GN','B301',3, TRUE);
PERFORM _tt('INFT-4-A','Monday','13:45-14:45','SPD','EX1','F102',1);
PERFORM _tt('INFT-4-A','Monday','13:45-14:45','MVRP','GN','B301',2);
PERFORM _tt('INFT-4-A','Monday','14:45-15:45','SPD','EX1','F102',1, TRUE);
PERFORM _tt('INFT-4-A','Monday','14:45-15:45','MVRP','GN','B301',2, TRUE);
PERFORM _tt('INFT-4-A','Monday','15:45-16:45','MVRP','SAM','M414A',3);
PERFORM _tt('INFT-4-A','Monday','16:45-17:45','MVRP','SAM','M414A',3, TRUE);

-- Tuesday
PERFORM _tt('INFT-4-A','Tuesday','09:00-10:00','AT','ST','E101',NULL);
PERFORM _tt('INFT-4-A','Tuesday','10:00-11:00','AT','ST','E101',NULL, TRUE);
PERFORM _tt('INFT-4-A','Tuesday','11:15-12:15','DBMS','VB','E101',NULL);
PERFORM _tt('INFT-4-A','Tuesday','12:15-13:15','DBMS','VB','E101',NULL, TRUE);
PERFORM _tt('INFT-4-A','Tuesday','13:45-14:45','OS LAB','RSR','L07B',1);
PERFORM _tt('INFT-4-A','Tuesday','13:45-14:45','CN LAB','ARK','L11A',2);
PERFORM _tt('INFT-4-A','Tuesday','13:45-14:45','DBMS LAB','AVL','L07D',3);
PERFORM _tt('INFT-4-A','Tuesday','14:45-15:45','OS LAB','RSR','L07B',1, TRUE);
PERFORM _tt('INFT-4-A','Tuesday','14:45-15:45','CN LAB','ARK','L11A',2, TRUE);
PERFORM _tt('INFT-4-A','Tuesday','14:45-15:45','DBMS LAB','AVL','L07D',3, TRUE);
PERFORM _tt('INFT-4-A','Tuesday','15:45-16:45','FBET','ET1','M315',NULL);
PERFORM _tt('INFT-4-A','Tuesday','16:45-17:45','FBET','ET1','M315',NULL, TRUE);

-- Wednesday
PERFORM _tt('INFT-4-A','Wednesday','09:00-10:00','CN','KGD','E101',NULL);
PERFORM _tt('INFT-4-A','Wednesday','10:00-11:00','CN','KGD','E101',NULL, TRUE);
PERFORM _tt('INFT-4-A','Wednesday','11:15-12:15','OS','RSR','E101',NULL);
PERFORM _tt('INFT-4-A','Wednesday','12:15-13:15','OS','RSR','E101',NULL, TRUE);
PERFORM _tt('INFT-4-A','Wednesday','13:45-14:45','PCD1','RDE','D 105',NULL);
PERFORM _tt('INFT-4-A','Wednesday','14:45-15:45','PCD1','RDE','D 105',NULL, TRUE);
PERFORM _tt('INFT-4-A','Wednesday','15:45-16:45','FBET','ET1','M315',NULL);
PERFORM _tt('INFT-4-A','Wednesday','16:45-17:45','FBET','ET1','M315',NULL, TRUE);

-- Thursday
PERFORM _tt('INFT-4-A','Thursday','09:00-10:00','DBMS LAB','VB','L07D',1);
PERFORM _tt('INFT-4-A','Thursday','09:00-10:00','PY','PCK','CC03',2);
PERFORM _tt('INFT-4-A','Thursday','09:00-10:00','OS LAB','RSR','L07B',3);
PERFORM _tt('INFT-4-A','Thursday','10:00-11:00','DBMS LAB','VB','L07D',1, TRUE);
PERFORM _tt('INFT-4-A','Thursday','10:00-11:00','PY','PCK','CC03',2, TRUE);
PERFORM _tt('INFT-4-A','Thursday','10:00-11:00','OS LAB','RSR','L07B',3, TRUE);
PERFORM _tt('INFT-4-A','Thursday','11:15-12:15','EM 4','USK','E101',NULL);
PERFORM _tt('INFT-4-A','Thursday','12:15-13:15','EM 4','USK','E101',NULL, TRUE);
PERFORM _tt('INFT-4-A','Thursday','13:45-14:45','PY','PCK','E101',NULL);
PERFORM _tt('INFT-4-A','Thursday','14:45-15:45','PY','PCK','E101',NULL, TRUE);
PERFORM _tt('INFT-4-A','Thursday','15:45-16:45','ADSBI','AVL','E201',1);
PERFORM _tt('INFT-4-A','Thursday','15:45-16:45','MVRP','SAM','B303A',2);
PERFORM _tt('INFT-4-A','Thursday','16:45-17:45','ADSBI','AVL','E201',1, TRUE);
PERFORM _tt('INFT-4-A','Thursday','16:45-17:45','MVRP','SAM','B303A',2, TRUE);

-- Friday
PERFORM _tt('INFT-4-A','Friday','09:00-10:00','CN LAB','VB','L11A',1);
PERFORM _tt('INFT-4-A','Friday','09:00-10:00','DBMS LAB','VB','L07D',2);
PERFORM _tt('INFT-4-A','Friday','09:00-10:00','PY','PCK','CC03',3);
PERFORM _tt('INFT-4-A','Friday','10:00-11:00','CN LAB','VB','L11A',1, TRUE);
PERFORM _tt('INFT-4-A','Friday','10:00-11:00','DBMS LAB','VB','L07D',2, TRUE);
PERFORM _tt('INFT-4-A','Friday','10:00-11:00','PY','PCK','CC03',3, TRUE);
PERFORM _tt('INFT-4-A','Friday','11:15-12:15','EM 4','USK','E101',NULL);
PERFORM _tt('INFT-4-A','Friday','12:15-13:15','EM 4','USK','E101',NULL, TRUE);
PERFORM _tt('INFT-4-A','Friday','13:45-14:45','PY','BGT','CC03',1);
PERFORM _tt('INFT-4-A','Friday','13:45-14:45','OS LAB','RSR','M312B',2);
PERFORM _tt('INFT-4-A','Friday','13:45-14:45','CN LAB','VVB','M310B',3);
PERFORM _tt('INFT-4-A','Friday','14:45-15:45','PY','BGT','CC03',1, TRUE);
PERFORM _tt('INFT-4-A','Friday','14:45-15:45','OS LAB','RSR','M312B',2, TRUE);
PERFORM _tt('INFT-4-A','Friday','14:45-15:45','CN LAB','VVB','M310B',3, TRUE);
PERFORM _tt('INFT-4-A','Friday','15:45-16:45','MVRP','SAM','B303A',3);
PERFORM _tt('INFT-4-A','Friday','16:45-17:45','MVRP','SAM','B303A',3, TRUE);

-- ================= DIVISION B (SE-B) =================
-- Monday
PERFORM _tt('INFT-4-B','Monday','09:00-10:00','CN','KGD','E204',NULL);
PERFORM _tt('INFT-4-B','Monday','10:00-11:00','CN','KGD','E204',NULL, TRUE);
PERFORM _tt('INFT-4-B','Monday','11:15-12:15','ADSBI','AVL','E204',NULL);
PERFORM _tt('INFT-4-B','Monday','12:15-13:15','ADSBI','AVL','E204',NULL, TRUE);
PERFORM _tt('INFT-4-B','Monday','13:45-14:45','PY','PCK','CC03',1);
PERFORM _tt('INFT-4-B','Monday','13:45-14:45','DBMS LAB','VB','L07D',2);
PERFORM _tt('INFT-4-B','Monday','13:45-14:45','OS LAB','RSR','L07B',3);
PERFORM _tt('INFT-4-B','Monday','14:45-15:45','PY','PCK','CC03',1, TRUE);
PERFORM _tt('INFT-4-B','Monday','14:45-15:45','DBMS LAB','VB','L07D',2, TRUE);
PERFORM _tt('INFT-4-B','Monday','14:45-15:45','OS LAB','RSR','L07B',3, TRUE);
PERFORM _tt('INFT-4-B','Monday','15:45-16:45','SPD','EX1','F102',NULL);
PERFORM _tt('INFT-4-B','Monday','16:45-17:45','SPD','EX1','F102',NULL, TRUE);

-- Tuesday
PERFORM _tt('INFT-4-B','Tuesday','09:00-10:00','CN LAB','VB','L11A',1);
PERFORM _tt('INFT-4-B','Tuesday','09:00-10:00','DBMS LAB','AVL','L07D',2);
PERFORM _tt('INFT-4-B','Tuesday','09:00-10:00','PY','PCK','CC03',3);
PERFORM _tt('INFT-4-B','Tuesday','10:00-11:00','CN LAB','VB','L11A',1, TRUE);
PERFORM _tt('INFT-4-B','Tuesday','11:15-12:15','OS','RSR','E204',NULL);
PERFORM _tt('INFT-4-B','Tuesday','12:15-13:15','OS','RSR','E204',NULL, TRUE);
PERFORM _tt('INFT-4-B','Tuesday','13:45-14:45','OS LAB','RSR','L07B',1);
PERFORM _tt('INFT-4-B','Tuesday','13:45-14:45','CN LAB','VVB','L11A',2);
PERFORM _tt('INFT-4-B','Tuesday','13:45-14:45','DBMS LAB','VDC','L07D',3);
PERFORM _tt('INFT-4-B','Tuesday','14:45-15:45','OS LAB','RSR','L07B',1, TRUE);
PERFORM _tt('INFT-4-B','Tuesday','15:45-16:45','ADSBI','AVL','M202',2);

-- Wednesday
PERFORM _tt('INFT-4-B','Wednesday','09:00-10:00','DBMS LAB','VDC','L07D',1);
PERFORM _tt('INFT-4-B','Wednesday','09:00-10:00','OS LAB','RSR','L07B',2);
PERFORM _tt('INFT-4-B','Wednesday','09:00-10:00','CN LAB','VB','L11A',3);
PERFORM _tt('INFT-4-B','Wednesday','10:00-11:00','DBMS LAB','VDC','L07D',1, TRUE);
PERFORM _tt('INFT-4-B','Wednesday','11:15-12:15','DBMS','VDC','E204',NULL);
PERFORM _tt('INFT-4-B','Wednesday','12:15-13:15','DBMS','VDC','E204',NULL, TRUE);
PERFORM _tt('INFT-4-B','Wednesday','13:45-14:45','EM 4','USK','E204',NULL);
PERFORM _tt('INFT-4-B','Wednesday','14:45-15:45','EM 4','USK','E204',NULL, TRUE);
PERFORM _tt('INFT-4-B','Wednesday','15:45-16:45','FBET','ET1','M315',1);

-- Thursday
PERFORM _tt('INFT-4-B','Thursday','09:00-10:00','AT','ST','E204',NULL);
PERFORM _tt('INFT-4-B','Thursday','10:00-11:00','AT','ST','E204',NULL, TRUE);
PERFORM _tt('INFT-4-B','Thursday','11:15-12:15','DBMS LAB','AVL','L07D',1);
PERFORM _tt('INFT-4-B','Thursday','11:15-12:15','PY','PCK','CC03',2);
PERFORM _tt('INFT-4-B','Thursday','11:15-12:15','OS LAB','RSR','L07B',3);
PERFORM _tt('INFT-4-B','Thursday','12:15-13:15','DBMS LAB','AVL','L07D',1, TRUE);
PERFORM _tt('INFT-4-B','Thursday','13:45-14:45','EM 4','USK','E204',NULL);
PERFORM _tt('INFT-4-B','Thursday','14:45-15:45','EM 4','USK','E204',NULL, TRUE);
PERFORM _tt('INFT-4-B','Thursday','15:45-16:45','MVRP','SAM','M414A',2);

-- Friday
PERFORM _tt('INFT-4-B','Friday','09:00-10:00','PCD1','PY','E204',NULL);
PERFORM _tt('INFT-4-B','Friday','10:00-11:00','PCD1','PY','E204',NULL, TRUE);
PERFORM _tt('INFT-4-B','Friday','13:45-14:45','CN','KGD','E204',NULL);
PERFORM _tt('INFT-4-B','Friday','14:45-15:45','CN','KGD','E204',NULL, TRUE);
PERFORM _tt('INFT-4-B','Friday','15:45-16:45','MVRP','SAM','M414A',3);

-- ================= DIVISION C (SE-C) =================
-- Monday
PERFORM _tt('INFT-4-C','Monday','09:00-10:00','PCD1','RDE','E301',NULL);
PERFORM _tt('INFT-4-C','Monday','10:00-11:00','PCD1','RDE','E301',NULL, TRUE);
PERFORM _tt('INFT-4-C','Monday','11:15-12:15','ADSBI','AVL','E201',1);
PERFORM _tt('INFT-4-C','Monday','11:15-12:15','SPD','EX1','F102',2);
PERFORM _tt('INFT-4-C','Monday','11:15-12:15','MVRP','GN','B301',3);
PERFORM _tt('INFT-4-C','Monday','13:45-14:45','SPD','EX1','F102',1);
PERFORM _tt('INFT-4-C','Monday','13:45-14:45','MVRP','GN','B301',2);
PERFORM _tt('INFT-4-C','Monday','15:45-16:45','MVRP','SAM','M414A',3);

-- Tuesday
PERFORM _tt('INFT-4-C','Tuesday','09:00-10:00','DBMS','VDC','E301',NULL);
PERFORM _tt('INFT-4-C','Tuesday','11:15-12:15','OS','RSR','E301',NULL);
PERFORM _tt('INFT-4-C','Tuesday','13:45-14:45','CN','KGD','E301',NULL);
PERFORM _tt('INFT-4-C','Tuesday','15:45-16:45','FBET','ET1','M315',NULL);

-- Wednesday
PERFORM _tt('INFT-4-C','Wednesday','09:00-10:00','OS LAB','RSR','L07B',1);
PERFORM _tt('INFT-4-C','Wednesday','09:00-10:00','CN LAB','ARK','L11A',2);
PERFORM _tt('INFT-4-C','Wednesday','09:00-10:00','DBMS LAB','AVL','L07D',3);
PERFORM _tt('INFT-4-C','Wednesday','11:15-12:15','DBMS LAB','AVL','L07D',1);
PERFORM _tt('INFT-4-C','Wednesday','11:15-12:15','PY','PCK','CC03',2);
PERFORM _tt('INFT-4-C','Wednesday','11:15-12:15','OS LAB','SM','L07B',3);
PERFORM _tt('INFT-4-C','Wednesday','13:45-14:45','EM 4','USK','E301',NULL);
PERFORM _tt('INFT-4-C','Wednesday','15:45-16:45','FBET','ET1','M315',1);

-- Thursday
PERFORM _tt('INFT-4-C','Thursday','09:00-10:00','CN LAB','ARK','L11A',1);
PERFORM _tt('INFT-4-C','Thursday','09:00-10:00','DBMS LAB','BGT','L11B',2);
PERFORM _tt('INFT-4-C','Thursday','11:15-12:15','AT','ST','E301',NULL);
PERFORM _tt('INFT-4-C','Thursday','13:45-14:45','OS','RSR','E301',NULL);
PERFORM _tt('INFT-4-C','Thursday','15:45-16:45','ADSBI','AVL','E201',2);

-- Friday
PERFORM _tt('INFT-4-C','Friday','09:00-10:00','OS LAB','RSR','L07B',NULL);
PERFORM _tt('INFT-4-C','Friday','11:15-12:15','AT','ST','E301',NULL);
PERFORM _tt('INFT-4-C','Friday','13:45-14:45','EM 4','USK','E301',NULL);
PERFORM _tt('INFT-4-C','Friday','15:45-16:45','MVRP','SAM','B303A',2);

END $$;
DROP FUNCTION IF EXISTS _tt(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,INT,BOOLEAN);
COMMIT;
