import uuid
import random

years = [1, 2, 3, 4]
divisions = ['A', 'B', 'C']
students_per_div = 60

# Common Indian names for realism
first_names = ["Arjun", "Aditya", "Aryan", "Aavash", "Bhavya", "Chetan", "Deepak", "Eshan", "Farhan", "Gautam", "Harsh", "Ishaan", "Jatin", "Karan", "Laksh", "Manish", "Nitin", "Om", "Pranav", "Rahul", "Sahil", "Tanmay", "Uday", "Varun", "Yash", "Zaid", "Ananya", "Bhakti", "Chitra", "Deepika", "Esha", "Falguni", "Gauri", "Hina", "Isha", "Jaya", "Kavya", "Laxmi", "Megha", "Neha", "Ojaswi", "Pooja", "Riya", "Sneha", "Tanya", "Urvi", "Vani", "Yamini", "Zara"]
last_names = ["Sharma", "Patel", "Verma", "Gupta", "Iyer", "Nair", "Reddy", "Singh", "Desai", "Joshi", "Kulkarni", "Mehta", "Shah", "Malhotra", "Kapoor", "Chopra", "Dutta", "Banerjee", "Chatterjee", "Mishra", "Trivedi", "Pandey"]

sql_cmds = ["-- Populate IT Department Students"]

# Step 1: Create divisions
for y in years:
    sem = y * 2
    for d in divisions:
        div_name = f"IT-{d}"
        # We need a way to distinguish years in naming to avoid constraint issues
        full_div_name = f"FE-IT-{d}" if y == 1 else f"SE-IT-{d}" if y == 2 else f"TE-IT-{d}" if y == 3 else f"BE-IT-{d}"
        
        sql_cmds.append(f"INSERT INTO divisions (division_name, year, semester, department, strength, is_active) VALUES ('{full_div_name}', {y}, {sem}, 'IT', {students_per_div}, true) ON CONFLICT (division_name, department, year) DO UPDATE SET strength = {students_per_div};")

        # Step 2: Generate students for this division
        start_year = 24 - y
        for i in range(1, students_per_div + 1):
            f_name = random.choice(first_names)
            l_name = random.choice(last_names)
            full_name = f"{f_name} {l_name}"
            # Roll number format: 22IT201 (Year Prefix + IT + Sequence)
            # sequence part needs to be unique. i is the sequence.
            roll_no = f"{start_year}IT{y}{str(i).zfill(2)}"
            email = f"{f_name.lower()}.{l_name.lower()}.{roll_no.lower()}@vit.edu.in"
            
            sql_cmds.append(f"INSERT INTO students (full_name, roll_number, email, division_id, is_active) VALUES ('{full_name}', '{roll_no}', '{email}', (SELECT id FROM divisions WHERE division_name = '{full_div_name}' AND year = {y} AND department = 'IT' LIMIT 1), true) ON CONFLICT (roll_number) DO NOTHING;")

with open('/Users/yashodhanrajapkar/Documents/Projects/dlr-claude/populate_it.sql', 'w') as f:
    f.write("\n".join(sql_cmds))
