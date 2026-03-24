-- Insert Faculty Data from INFT Faculty Initial A.Y. 2025-26
-- Department: Information Technology
-- Total Faculty: 20

-- Drop the old foreign key constraint if it exists (from previous schema version)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

INSERT INTO public.users (id, email, full_name, role, department, phone) VALUES
  (gen_random_uuid(), 'vidya.chitre@vit.edu.in', 'Dr. Vidya Chitre', 'faculty', 'IT', '9702476405'),
  (gen_random_uuid(), 'varsha.bhasale@vit.edu.in', 'Dr. Varsha Bhosale', 'faculty', 'IT', '9820580658'),
  (gen_random_uuid(), 'dilip.motwani@vit.edu.in', 'Dr. Dilip Motwani', 'faculty', 'IT', '9820804727'),
  (gen_random_uuid(), 'sushopti.gawade@vit.edu.in', 'Dr. Sushopti Gawade', 'faculty', 'IT', '8369323410'),
  (gen_random_uuid(), 'santosh.tamboli@vit.edu.in', 'Dr. Santosh Tamboli', 'faculty', 'IT', '9867211982'),
  (gen_random_uuid(), 'rugved.deolekar@vit.edu.in', 'Dr. Rugved Deolekar', 'faculty', 'IT', '9833116223'),
  (gen_random_uuid(), 'shashikant.mahajan@vit.edu.in', 'Dr. Shashikant Mahajan', 'faculty', 'IT', '8097615087'),
  (gen_random_uuid(), 'ajitkumar.khachane@vit.edu.in', 'Prof. Ajitkumar Khachane', 'faculty', 'IT', '9820452235'),
  (gen_random_uuid(), 'digambar.puri@vit.edu.in', 'Dr. Digambar Puri', 'faculty', 'IT', '7400292397'),
  (gen_random_uuid(), 'rasika.ransing@vit.edu.in', 'Dr. Rasika Ransing', 'faculty', 'IT', '9619026235'),
  (gen_random_uuid(), 'akshay.loke@vit.edu.in', 'Prof. Akshay Loke', 'faculty', 'IT', '9869386342'),
  (gen_random_uuid(), 'debarati.ghosal@vit.edu.in', 'Prof. Debarati Ghosal', 'faculty', 'IT', '9930172242'),
  (gen_random_uuid(), 'deepali.shrikhande@vit.edu.in', 'Prof. Deepali Shrikhande', 'faculty', 'IT', '7021980818'),
  (gen_random_uuid(), 'bhanu.tekwani@vit.edu.in', 'Prof. Bhanu Tekwani', 'faculty', 'IT', '9665518788'),
  (gen_random_uuid(), 'kanchan.dhuri@vit.edu.in', 'Prof. Kanchan Dhuri', 'faculty', 'IT', '9082872632'),
  (gen_random_uuid(), 'neha.kudu@vit.edu.in', 'Prof. Neha Kudu', 'faculty', 'IT', '8082103988'),
  (gen_random_uuid(), 'vinita.bhandiwad@vit.edu.in', 'Prof. Vinita Bhandiwad', 'faculty', 'IT', '9004875054'),
  (gen_random_uuid(), 'shruti.agarwal@vit.edu.in', 'Prof. Shruti Agarwal', 'faculty', 'IT', '7709987672'),
  (gen_random_uuid(), 'pallavi.kharat@vit.edu.in', 'Prof. Pallavi Kharat', 'faculty', 'IT', '9930007608'),
  (gen_random_uuid(), 'dhanashree1.tamhane@vit.edu.in', 'Prof. Dhanashree Tamhane', 'faculty', 'IT', '9892619068')
ON CONFLICT (email) DO NOTHING;

-- Update initials and phone from Excel data
UPDATE public.users SET initials = 'VDC', phone = '9702476405' WHERE email = 'vidya.chitre@vit.edu.in';
UPDATE public.users SET initials = 'VB', phone = '9820580658' WHERE email = 'varsha.bhasale@vit.edu.in';
UPDATE public.users SET initials = 'DM', phone = '9820804727' WHERE email = 'dilip.motwani@vit.edu.in';
UPDATE public.users SET initials = 'SDG', phone = '8369323410' WHERE email = 'sushopti.gawade@vit.edu.in';
UPDATE public.users SET initials = 'ST', phone = '9867211982' WHERE email = 'santosh.tamboli@vit.edu.in';
UPDATE public.users SET initials = 'RVD', phone = '9833116223' WHERE email = 'rugved.deolekar@vit.edu.in';
UPDATE public.users SET initials = 'ST', phone = '8097615087' WHERE email = 'shashikant.mahajan@vit.edu.in';
UPDATE public.users SET initials = 'ARK', phone = '9820452235' WHERE email = 'ajitkumar.khachane@vit.edu.in';
UPDATE public.users SET initials = 'DVP', phone = '7400292397' WHERE email = 'digambar.puri@vit.edu.in';
UPDATE public.users SET initials = 'RSR', phone = '9619026235' WHERE email = 'rasika.ransing@vit.edu.in';
UPDATE public.users SET initials = 'AVL', phone = '9869386342' WHERE email = 'akshay.loke@vit.edu.in';
UPDATE public.users SET initials = 'DG', phone = '9930172242' WHERE email = 'debarati.ghosal@vit.edu.in';
UPDATE public.users SET initials = 'DSJ', phone = '7021980818' WHERE email = 'deepali.shrikhande@vit.edu.in';
UPDATE public.users SET initials = 'BGT', phone = '9665518788' WHERE email = 'bhanu.tekwani@vit.edu.in';
UPDATE public.users SET initials = 'KGD', phone = '9082872632' WHERE email = 'kanchan.dhuri@vit.edu.in';
UPDATE public.users SET initials = 'NKR', phone = '8082103988' WHERE email = 'neha.kudu@vit.edu.in';
UPDATE public.users SET initials = 'VVB', phone = '9004875054' WHERE email = 'vinita.bhandiwad@vit.edu.in';
UPDATE public.users SET initials = 'SHA', phone = '7709987672' WHERE email = 'shruti.agarwal@vit.edu.in';
UPDATE public.users SET initials = 'PCK', phone = '9930007608' WHERE email = 'pallavi.kharat@vit.edu.in';
UPDATE public.users SET initials = 'DST', phone = '9892619068' WHERE email = 'dhanashree1.tamhane@vit.edu.in';



