-- ============================================================
-- VIT DLR PORTAL — STUDENT SEED WITH BATCH NUMBERS
-- Auto-generated from Excel attendance files
-- ============================================================

-- Add batch_number column to students table (safe, idempotent)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS batch_number INTEGER;

DELETE FROM public.students;


-- Division IT-A  Sem 4  Year 2  (79 students)
DO $$ DECLARE v_div UUID; BEGIN
  SELECT id INTO v_div FROM public.divisions
    WHERE division_name='IT-A' AND year=2 AND department='IT' LIMIT 1;
  IF v_div IS NULL THEN RAISE WARNING 'Division IT-A year 2 not found'; RETURN; END IF;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0002','SHAYAAN CHITRE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0006','SAMEER  JAGTAP', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0007','DARPAN PHADKE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0010','FAAEQ SAYED', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0011','MOHAMMED TALHA KHAN', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0013','VIRAJ BHADANGE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0014','ABDUL HAKIM SHAIKH', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0015','MAYURI KINAKE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0016','SACHIN YADAV', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0017','ABEDAN BISWAL', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0018','NAVEEN  KALDATE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0020','NINAD GABHALE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0021','TANAYA LOKHANDE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0022','SAIRAJ KHANDAGALE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0023','ABHIJEET SADAMATE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0024','SAYALI ANDHALE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0025','AMAAN SIDDIQUE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0026','UDAY MAHAJAN', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0027','SHIVAM  MISHRA', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0028','MANTHAN DHOKTE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0029','AVINASH PADVI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0030','ASHWIN AMBASTHA', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0031','SHREYA SURVE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0032','CHANDANI SAW', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0033','NIKHIL SAKPAL', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0034','YASH MORE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0035','SUMIT GHATUL', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0036','ADITYA SHINDE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0037','SOHAM DUGADE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0038','AADITYA SURYAWANSHI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0039','ATHARV GHORPADE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0040','OM RATHOD', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0041','ABUBAKAR AHMED', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0042','SRUSHTI BANUGADE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0043','RITIK JAIN', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0045','SHRAVNI ANDHALE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0046','SRUSHTI PADVI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0047','KAVITA GUPTA', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0048','SANSKRUTI PALKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0049','SIDDHARTH  SHINDE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0050','CHIRAG POOJARY', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0051','MOHAMMAD ARHAAM SHAIKH', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0052','AAYUSH BHOGALE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0053','PRANIT WAGHMARE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0054','MARTAND JADHAV', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0055','DARSHAN PALKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0056','ANKUR  KESARKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0057','OM  PAWAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0058','AENOSE JOEL GURRALA', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0060','ROMIN KHAN', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0061','GAURAV GHUDE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0062','MUNJA KADAM', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0063','FARHAN AHMAD KHAN', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0065','YASH PATIL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0066','JENISH  SHAH', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0067','SWARA BIRJE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0068','SAMPRATI  TIKONE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0069','OM YEWALE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0070','KEDAR SAWANT', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0071','SAUKHYA GAIKWAD', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0072','LOKESH  MARATHE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0073','ADVAY TONGAONKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0074','SRUSHTI CHAVAN', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0075','AYUSH PATIL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0076','YASH  BAKALE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0077','ISHAN GURAV', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0078','MANTHAN SHAH', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0079','PREM YELWANDE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0080','JIYA KANOJIA', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A0081','ADITYA DANDAGVHAL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101A2001','DEEPALI GANACHARI', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101A2002','SNEHAL PATIL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101A2003','GRISHMA PATIL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101A2004','TEJAL SURKULE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101A2005','SARTHAK SONAWANE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101A2006','VAISHNAVI KUNTE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101A2007','ANUSHKA GADHAVE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101A2008','TANVI JAWARE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101A2009','SHRAVANI KADAM', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
END $$;

-- Division IT-B  Sem 4  Year 2  (74 students)
DO $$ DECLARE v_div UUID; BEGIN
  SELECT id INTO v_div FROM public.divisions
    WHERE division_name='IT-B' AND year=2 AND department='IT' LIMIT 1;
  IF v_div IS NULL THEN RAISE WARNING 'Division IT-B year 2 not found'; RETURN; END IF;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0001','MOHAMMED YUSUF SAYED', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0004','GAYATRI CHAND', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0005','DHANRAJ MOGERA', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0006','VARENNYA  POPHALI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0007','SHIVANSHU RAI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0008','RITESH ZAGADE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0009','GAURI KHATOKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0013','KARTIK MAILARAM', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0014','SAHIL SANAP', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0016','VAISHNAVI BAGADE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0017','DEVEN MAGAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0018','PREM RANMALE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0019','SWAYAM  SONAVNE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0021','JAGDISH  BAKLE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0022','SUMIT SURWASE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0023','SAMRUDDHI KHADE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0025','KRISH PATIL', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0026','SHREESH KHAMKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0027','PRANITHA SHETTY', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0028','SUJAL TIWARI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0029','PRADNYA CHAUDHARI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0030','SARTHAK KANE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0031','SHRIHARI DAVARE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0032','MRUNALI DEVARE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0034','SHREYAS  CHOUDHARY', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0035','HIMANSHU CHOYAL', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0036','PARTH KINAGE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0037','PRIYANSHU GUPTA', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0038','SHUBHAM MAHANWAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0040','VARAD DALVI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0042','SNEHA BHUNDERE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0043','OMKAR BENGALI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0044','RONAK BODDU', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0045','VIVEK KHANDARE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0046','RASHI KHUTWAD', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0047','VISHAL PRAJAPATI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0048','MOHD ALTAMASH ANSARI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0049','MEET ALSHI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0051','VEDANGI POKHARKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0052','ATHARV RAUT', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0053','PHALGUNI DHOPTE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0054','IMRAN SHAIKH', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0055','RONAK GHODE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0056','AMOL PATIL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0057','BHUSHAN BOROLE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0058','ROHIT RATHOD', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0061','ADITYA SARKATE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0063','AASHUTOSH MAHAJAN', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0064','NIKHAT MOMIN', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0065','SWAPNIL BHABAL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0068','YASH JADHAV', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0070','SHARWARI LOHATE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0071','TANISHKA  MANTRI', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0072','ADITYA PATRA', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0073','ADITYA  BHOGAVKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0074','KRISH  GHAG', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0075','SNIGDHA SEEPA', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0076','TANVEE KAMBLE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0077','KRISHNA TIWARI', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0078','SHRIYA VIBHUTE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0079','PEARL RATHOD', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0080','MANTHAN RATHI', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0081','SAIRAJ PATEKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0082','ATHARVA GAIKWAD', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B0083','MALHAAR NIKAM', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101B2001','SUJAL PATIL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101B2002','ADARSH RASAL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101B2003','VIBHAS KADAM', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101B2004','VEDANT SAKPAL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101B2005','SNEHA MAHADIK', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101B2006','BHUSHAN AVHAD', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101B2007','SHREEDHAR KHORATE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101B2008','IFFAT KHAN', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101B2009','SIMRAN WAGHMARE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
END $$;

-- Division IT-C  Sem 4  Year 2  (74 students)
DO $$ DECLARE v_div UUID; BEGIN
  SELECT id INTO v_div FROM public.divisions
    WHERE division_name='IT-C' AND year=2 AND department='IT' LIMIT 1;
  IF v_div IS NULL THEN RAISE WARNING 'Division IT-C year 2 not found'; RETURN; END IF;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0002','SHREEMAN KUMAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0003','OMKAR  PADHI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0004','DARSHAN KERKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0006','ATHARVA CHAVAN', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0007','MRUNAL WARANGE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0008','ATHARVA BHOSALE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0010','VEDANT CHAVAN', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0011','SAKSHI ROUNDHAL', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0013','BURHANUDDIN LOKHANDWALA', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0014','SHREYA MURKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0015','ASHWIN AGRAWAL', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0016','NEHA NAYAK', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0017','ANKITA SHANBHAG', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0018','SHWETA GUPTA', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0019','SHRIYA  SAWANT', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0020','ARYAN KELKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0021','PRATHAMESH SALUNKHE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0022','ARYAN ACHARYA', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0024','PRANAY  UPADHYAY', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0025','ROHAN SINGH', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0026','SUSHANT NIRATE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0027','DAKSH PARDESHI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0030','HUZAIFAH SHAIKH', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0031','RITIKA SHARMA', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0032','JAYA PATIL', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0033','DEVANGINI JADHAV', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0034','AAYUSH ABHYANKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0035','JAY  JADHAV', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0036','SHANTANU DALVI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0037','HARSH SURANA', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0038','SHLOK JAIN', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0039','ASHUTOSH TRIPATHI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0040','SAURABH  LUBAL', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0041','OM THAKUR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0042','SAKSHI JADHAV', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0043','RAHUL AMBHORE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0044','SUBHADEEP MONDAL', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0045','SHARVIL CHANDURKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0046','PUSHKAR CHAVAN', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0048','GAUTAM KESHARWANI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0051','GAURAV TIWARI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0052','KHUSH JAIN', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0053','VIVEK RAMINA', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0054','SAWANKUMAR GUPTA', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0056','ASAWARI NAVLE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0057','RUHAAN JOSHI', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0058','SARTHAK BONGANE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0059','KASHYAP SAKHARE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0060','JASWANDI VICHARE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0061','PRANAY BELNEKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0062','RUDRA JAIN', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0063','SHLOK SHINDE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0064','NIRMITI SAWANT', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0065','AYUSH KAMBLE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0066','SHAMITA  CHAVAN', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0067','DURVA MALUSARE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0068','VARUN SINGH', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0069','DEVANSH DHAWADE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0070','ANAGHA VICHARE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0071','ADITYA  KANNOJIYA', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0072','PRERNA CHAVAN', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0073','AARUSH NALAVADE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0074','MRUNALI PATIL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0075','SHAAN JANA', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0076','SHUBHAM SINGH', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0077','VEDANT TULASKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C0078','DAKSH MALUSKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101C2001','ESHA VALUNJ', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101C2002','JUVERIYA KHAN', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101C2003','RISHABH MAHADIK', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101C2004','DNYANESHWARI GADADHE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101C2005','NAMAN MEHTA', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101C2006','RUSHIKA GAIKWAD', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('25101C2007','VIVEK TANDEL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
END $$;

-- Division IT-A  Sem 6  Year 3  (78 students)
DO $$ DECLARE v_div UUID; BEGIN
  SELECT id INTO v_div FROM public.divisions
    WHERE division_name='IT-A' AND year=3 AND department='IT' LIMIT 1;
  IF v_div IS NULL THEN RAISE WARNING 'Division IT-A year 3 not found'; RETURN; END IF;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0001','MAYANK EKBOTE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0002','PRANJALI NANDKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0005','NIRANJANA CHAVAN', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0006','ARYAN DALAL', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0007','SANKHYA LONDHE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0008','SWAYAM BALLAL', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0009','VED THOMBRE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0010','SOHAM WAYANGANKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0011','AMAN VARMA', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0012','TEJAS KHANDARE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0013','SARVESH CHOUDHARY', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0014','JALAJA YELVE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0015','ARUNIMA PILLAI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0016','AKANKSHA JADHAV', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0017','SOHAN BHANGARE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0018','SUJAL JAKAKURE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0019','ROHIT GUPTA', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0020','BUSHRA SAEED', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0021','ALOK MESHRAM', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0022','ARYANT  JADHAV', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0023','KASHYAP NATHOO', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0024','RITESH PAWAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0025','ANSH  KUDALKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0026','RITIKA VARADKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0027','DIKSHA VAREKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0028','KAMRAAN MULANI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0029','SHUBHAM YADAV', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0030','OMPRAKASH MAURYA', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0031','SHUBHAM GAJARE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0032','SHREYA GAONKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0033','SHREYAS KHOBRAGADE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0034','KANHAIYALAL YADAV', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0035','ARADHYA JADHAV', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0036','ATHARV JADHAV', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0037','TEJAS SHINGTE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0038','DEVEN BAGADE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0039','KIRAT SINGH CHAWLA', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0041','ARYAN VARMA', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0042','ASMITA PAL', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0043','ATHARVA KENI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0045','ATHARVA DESHMUKH', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0047','SHARWAN SHINGADE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0048','ABHISHEK WALI', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0049','SAIF SIDDIQUI', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0050','JATIN RATHOD', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0051','YASHODHAN RAJAPKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0052','YADNIKA PASHTE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0053','CHAITRALI  MITHBAWKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0054','AYUSH SHEWALE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0055','HARSHAD KANERKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0056','SHREYAS KHARAT', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0059','AARYA KHAIRE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0060','PRITRAJ CHAUDHARY', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0061','SAIRAJ NAIKDHURE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0062','SHUBHAM WAVRE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0063','SARTHAK GAIKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0064','MANORANJAN PAUL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0065','RISHABH HEGDE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0067','KAIVALYA GHARAT', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0068','OMKAR MADAV', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0070','VIGHNARAJENDRA  KAKADE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0071','AYUSH GUJAR', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0072','PRITIVARDHINI SANGAVE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0073','SWARALI MAHISHI', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0074','TANAYA SALUNKE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0075','SWAYAM PAWAR', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0076','DEVEN HADKAR', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A0077','ISHWARI PANDIT', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A2001','ATHARVA GITAYE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A2002','APURV DESHMUKH', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A2003','PRITI CHAVAN', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A2004','SWATI MANE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A2005','ANISH BANDAL', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A2006','VIPUL RAGHATWAN', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A2007','MUKTA REDIJ', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A2008','ARYAN CHAVAN', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A2009','ADITYA MULEY', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101A2010','ANKITA PAWAR', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
END $$;

-- Division IT-B  Sem 6  Year 3  (78 students)
DO $$ DECLARE v_div UUID; BEGIN
  SELECT id INTO v_div FROM public.divisions
    WHERE division_name='IT-B' AND year=3 AND department='IT' LIMIT 1;
  IF v_div IS NULL THEN RAISE WARNING 'Division IT-B year 3 not found'; RETURN; END IF;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0002','VISHANT GAWALI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0003','KESHAV VERMA', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0004','SAMIKSHA DALVI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0005','DHRUV TIKHANDE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0006','ISHWAR GARJE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0007','SNEHA AJAGEKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0008','MADHUR PATIL', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0009','JAY  JANGAM', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0010','ATHARV PETKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0011','OM KHEDKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0012','SOHAM THAKUR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0013','AKASH MISALE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0014','ZAYAN SHAIKH', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0015','RUDRAPRATAP SHINDE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0016','TEJAS SONAWANE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0017','ROHIT DHOLE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0019','SARTHAK KULKARNI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0020','VINAY YADAV', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0021','PULKIT SAINI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0023','VEDIKA THALKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0024','VAIBHAV  BEDRE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0025','VAISHNAVI PATIL', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0026','HARSHAD  PATEKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0027','SHUBHAM BANEKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0028','GAUTAMI SURVE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0029','GAURI BAHETI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0030','ASHARANI SAHU', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0033','SHREYA JADHAO', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0034','TANAY SHINDE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0035','KASHISH GAJBHIYE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0036','SAMIKSHA WANKHEDE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0037','NIRAJ RATHOD', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0038','VRUSHALI KARPE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0040','NIKET LOLAYEKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0041','SHRUTI DAHIVALIKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0042','VARAD MHATRE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0044','HARSHAL DHARADE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0046','NISARG AMBAWADE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0049','SUNNY  THAKUR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0051','NEERAJ  DESHMKUH', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0053','AARYA TAMBDE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0056','JITESH GAIKWAD', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0058','DIKSHITA PIMPALE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0059','NEHA DHUMAL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0060','YASH PATIL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0062','PARTH MOKASHI', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0063','AMAN SINGH', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0064','PUNIT JADHAV', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0066','SARTHAK HANKARE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0067','OMKAR DHAWALE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0068','RAUNAK BAWEJA', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0069','HARSHVARDHAN  POYREKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0070','RIYA THAKUR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0071','NIKITA NAIK', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0072','SHANTANU RAUT', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0073','OM NIKAM', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0074','SHREYAS DESAI', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0075','MADHURA PATIL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0076','SAISH NALAVADE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0077','KHUSHALI DUKHANDE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0078','PURVESH TAWADE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0079','MOHAN LINGAMURTHY', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0080','ATHARVA SAWANT', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0081','RIYA VANAVE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0082','HARSH KUMBHAR', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0083','SUDEEP BOBDE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B0085','DILIP PAL', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0047','OM SHINDE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B2001','SHRUTI AVHAD', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B2002','DARSHAN JAIN', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B2003','YASH JADHAV', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B2004','KAUSHAL TRIVEDI', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B2005','CHETNA PADHI', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B2006','DURVESH  BHADGAONKAR', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B2007','SAHIL BORHADE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B2008','ADITYA BHANDARE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B2009','YASH VEKHANDE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101B2010','SAMRUDDHI LAD', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
END $$;

-- Division IT-C  Sem 6  Year 3  (74 students)
DO $$ DECLARE v_div UUID; BEGIN
  SELECT id INTO v_div FROM public.divisions
    WHERE division_name='IT-C' AND year=3 AND department='IT' LIMIT 1;
  IF v_div IS NULL THEN RAISE WARNING 'Division IT-C year 3 not found'; RETURN; END IF;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0002','MOHIT SINGH SONGRA', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0003','AKHIL MAHADIK', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0005','RUDRA DALVI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0006','PRANAV WAGHMARE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0007','VEDANT GHODEKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0008','TANISHQ CHAVAN', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0009','ATHARVA GANDHE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0010','ZUBIYA QUADRI', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0011','SUJAL JANGAM', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0012','ADARSH YADAV', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0014','VIGHNESH WAMAN', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0015','MAHESHWAREE TALEKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0018','KAJAL SINGH', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0019','ATHRAV  JAWANJAL', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0024','PRAJYOT GHANEKAR', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0025','HRISHIKESH THAKARE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0026','SANCHIT ATRE', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0027','NEERAJ SHARMA', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0028','OM SINGH', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0029','RUSHIKESH BHOR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0030','SAMEED MULLA', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0031','AKANKSHA CHOUGULE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0034','HARINI PANIGRAHI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0035','ADITYA DHADVE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0037','ADARSH DUBEY', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0038','ATHARVA NARINGREKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0039','SIDDHARTH ROMAN', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0040','VEDANT GUPTA', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0041','HARSH PRAJAPATI', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0042','PRAPTI BHAYDE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0043','RAJ NAGVEKAR', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0044','NEHA VERMA', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0045','DIYANSH JAIN', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0046','SOUVIK ROUTH', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0047','ARYAN SAWANT', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0048','DEVASHRI PAVLE', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0049','POOJA DIVEKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0050','OM SHELAKE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0051','PRADNYA KHANSE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0052','YASH SAWANT', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0053','YOORAJ GOLE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0054','SAKET PALANDE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0055','AADARSH SHARMA', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0056','GAURI KAMBLE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0057','SHREY PATHRE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0058','SAHIL NARKAR', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0059','YUVRAJ GANDHI', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0060','MANINI JAISWAL', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0061','GAURANG  NAIK', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0062','NISARG MULIK', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0063','PARTH  KAMBLE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0064','DURGESH DERE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0065','KIRTANA SINGH', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0066','ATHERVA  HANDE', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0067','SHAKIR KALU', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0068','SHREYASH PANDEY', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0069','MUSAB SAYYED', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0070','ADI SHETH', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0071','VIVEK DEORE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0072','MOHAMMED SHOAIB RAZA SHAIKH', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0073','ARNAV KHOT', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0074','SAI SHETTY', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0075','AKSHAT SHETTY', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0076','VEDANT PUNTAMBEKAR', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101C0077','SUDHIR GURUDU', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C2001','KHARADE RIYA KHARADE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C2002','CHOUDHARI SHIVANI CHOUDHARI', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C2003','JADHAV MANSI JADHAV', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C2004','SEJAL DHANVE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C2005','SIDDIQA KHAN KHAN', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C2006','MOHAMMED HASSAAN TOLE', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C2007','CHIRAG SHARMA', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C2008','RIYA MISHRA', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('24101C2009','TANYA JHA', v_div, 4)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
END $$;

-- Division IT-A  Sem 8  Year 4  (78 students)
DO $$ DECLARE v_div UUID; BEGIN
  SELECT id INTO v_div FROM public.divisions
    WHERE division_name='IT-A' AND year=4 AND department='IT' LIMIT 1;
  IF v_div IS NULL THEN RAISE WARNING 'Division IT-A year 4 not found'; RETURN; END IF;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0002','Siddhi Shinde', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0003','Asmita Jadhav', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0004','Amrita De', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0005','Vainavi Lad', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0006','Mrugank Vichare', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0007','Neetish Dhavgaye', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0008','Arpit Hande', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0009','Renuka Kadam', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0010','Insha Khan', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0011','Komal  Jadhav', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0012','Dipika Dattatray Gadekar', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0013','Abhijeet pomane', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0014','Ganesh Tukaram Waghmare', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0015','Saurav Sanjay mate', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0016','Anuj Gill', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0018','Yash Vivek Sawant', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0022','Yash Rupesh Pagar', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0025','Anushka Thacore', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0026','Prajakta Nitin Chorge', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0027','Sahil Shangloo', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0028','Sankalp Rajendra Wani', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0029','Pratik Jitendra Sawant', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0030','Rasika Jade', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0031','Vinay Uttam Pawar', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0032','Ruchika Chavan', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0033','Tejas Kunde', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0034','Tanvi Kharade', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0035','Abhijit Vinayak Palve', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0036','Harshal sonawane', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0037','Sonal Solaskar', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0038','Himanshu Narendra Pathak', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0039','Rutuja Sargar', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0040','Roshan Vilas Khatal', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0041','Abhishek Deepak Pawaskar', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0042','Rohan Shatrughan Bage', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0043','Arya Chavan', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0044','Abhinav Upadhyay', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0045','Pavankumar Fasale', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0046','Divya Poojari', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0047','Harsh Rawte', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0048','Saiel Lad', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0049','Arkan Khan', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0050','Aryan kelshikar', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0051','Rakshit Naik', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0053','Harshada Chaudhari', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0054','Yash Newalkar', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0055','Sanskruti Kalpesh Mistry', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0056','Kalpak Kulkarni', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0057','Siddhesh Kadam', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0058','Tanmay Thakare', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0059','Gargi Kshirsagar', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0060','Arpit Gaikwad', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0062','Lekhanshu Ganveer', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0063','Rugved Mokashi', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0064','Parth Kale', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0065','Jayant Pravin Dethe', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0066','Omkar Mane', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0067','Abhishek Pal', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0068','Lakhan Subhash Kale', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0069','Karan goyal', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0070','Rutuja Harish Bangera', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0071','Parth gupta', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0072','Atharv Mahale', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0073','Om Alve', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0074','Ajay Ramkisan mali', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0075','Bhagyoday bade', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0076','Aditi Rao', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0077','Riya Singh', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0078','Sampurna Prabhu', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101A0079','Sujal Lambour', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A2001','Shlok Banubakode', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A2002','Asmika Panchal', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A2003','Vismay vikas whavle', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A2004','Vaishnavi Rajguru', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A2005','Amey Sandip Gaikwad', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A2006','Mansi Sitaram Burud', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A2007','Kunal Subhash Mundhe', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101A2008','Niriksha Nitendra Shivalkar', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
END $$;

-- Division IT-B  Sem 8  Year 4  (72 students)
DO $$ DECLARE v_div UUID; BEGIN
  SELECT id INTO v_div FROM public.divisions
    WHERE division_name='IT-B' AND year=4 AND department='IT' LIMIT 1;
  IF v_div IS NULL THEN RAISE WARNING 'Division IT-B year 4 not found'; RETURN; END IF;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('16101B0071','Tushar Kadvatar', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0001','Sanjana Kurade', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0002','Sasmit Sakpal', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0003','Atharva Ajagekar', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0004','Shravani Jayprakash Borji', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0005','Sarthak Borde', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0006','Sahil Sanjay Sakpal', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0007','Nilay Pandya', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0008','Chinmay Tikole', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0009','Arya Pandey', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0010','Ayush Bitla', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0011','Sneha Brahmane', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0012','Atharva Jamdade', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0013','Mansi Patil', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0014','Tejas Tanaji Shinde', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0015','Anish Pimple', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0016','Sanika Jade', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0017','Ameya Mahajan', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0018','Dip Sonu Sawant', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0019','Sumit jaywant bhoir', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0022','Mohit koli', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0023','Sahil Ansari', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0025','Mohd Ismail Quadri', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0026','Halim Shaikh', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0027','Riya Pal', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0028','Eshaan Padhye', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0029','Siddhesh Sunil Gharat', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0030','Aniket Panchal', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0031','Pradyumna Kale', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0032','Sahil Hemant Thale', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0034','Ishwari Raut', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0036','Aditya Shahi', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0037','Aneesh Angane', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0038','Akshay Gabhane', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0039','Atharv Patil', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0040','Gaurav Khanna', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0041','Tanishka Kasliwal', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0042','Shubham Shinde', v_div, 2)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0043','Mayur Parab', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0045','Mangeshkumar Shah', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0046','Amaan Kasu', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0049','Om Ramesh Singh', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0050','Pavankumar Singh', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0051','Rishil Ramdhumal', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0052','Mrunal Sangade', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0053','Soham Ghogare', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0054','Soham Bagayatkar', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0055','Varun Kirkire', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0056','Atharva Urankar', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0057','Mrunmayee Yadav', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0058','Aarya Patil', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0059','Rushikesh Bandiwadekar', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0060','Srushti jadhav', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0061','Sairaj Ambre', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0062','Rashmi Sahu', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0063','Parth Karande', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0064','Aareian Nakhawa', v_div, 3)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0065','Atharva Dali', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0066','Arya Sanjay Sadigale', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0067','Ayush Singh', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0068','Tejas Dipak Chorage', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0069','Saloni Varekar', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0070','Ishaan Dhuri', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0071','Sahil Naik', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('22101B0072','Ganesh Choudhary', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B2001','Om sunil sagvekar', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B2002','Sanjay Mahabal', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B2003','Aditya Chikane', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B2004','Medha Avhad', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B2006','Chinmayee Avinash Deshmukh', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B2007','Vaishnavi dhanaji karape', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
  INSERT INTO public.students (roll_number, full_name, division_id, batch_number)
    VALUES ('23101B2008','Aishwarya Prakash Huddar', v_div, 1)
    ON CONFLICT (roll_number) DO UPDATE SET full_name=EXCLUDED.full_name,
      division_id=EXCLUDED.division_id, batch_number=EXCLUDED.batch_number;
END $$;

-- Verification
SELECT d.division_name, d.semester, d.year, s.batch_number, COUNT(s.id) AS count
FROM public.students s JOIN public.divisions d ON d.id = s.division_id
GROUP BY d.division_name, d.semester, d.year, s.batch_number
ORDER BY d.year, d.division_name, s.batch_number;
