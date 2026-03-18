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
  (gen_random_uuid(), 'dhanashree1.tamhane@vit.edu.in', 'Prof. Dhanashree Tamhane', 'faculty', 'IT', '9892619068');



