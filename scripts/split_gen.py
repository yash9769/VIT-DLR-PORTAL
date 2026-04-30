import random

years = {
    1: "FE",
    2: "SE",
    3: "TE",
    4: "BE"
}
divs = ["A", "B", "C"]

first_names = ["Arjun", "Aditya", "Aryan", "Aavash", "Bhavya", "Chetan", "Deepak", "Eshan", "Farhan", "Gautam", "Harsh", "Ishaan", "Jatin", "Karan", "Laksh", "Manish", "Nitin", "Om", "Pranav", "Rahul", "Sahil", "Tanmay", "Uday", "Varun", "Yash", "Zaid", "Ananya", "Bhakti", "Chitra", "Deepika", "Esha", "Falguni", "Gauri", "Hina", "Isha", "Jaya", "Kavya", "Laxmi", "Megha", "Neha", "Ojaswi", "Pooja", "Riya", "Sneha", "Tanya", "Urvi", "Vani", "Yamini", "Zara"]
last_names = ["Sharma", "Patel", "Verma", "Gupta", "Iyer", "Nair", "Reddy", "Singh", "Desai", "Joshi", "Kulkarni", "Mehta", "Shah", "Malhotra", "Kapoor", "Chopra", "Dutta", "Banerjee", "Chatterjee", "Mishra", "Trivedi", "Pandey"]

for y, prefix in years.items():
    sql = []
    for d in divs:
        div_name = f"{prefix}-IT-{d}"
        sem = y * 2
        sql.append(f"INSERT INTO divisions (division_name, year, semester, department, strength, is_active) VALUES ('{div_name}', {y}, {sem}, 'IT', 60, true) ON CONFLICT (division_name, department, year) DO UPDATE SET strength = 60;")
        
        for i in range(1, 61):
            fn = random.choice(first_names)
            ln = random.choice(last_names)
            # Use division index to offset roll numbers within the same year
            roll_num = (divs.index(d) * 60) + i
            roll = f"{24-y}IT{y}{str(roll_num).zfill(3)}"
            email = f"{fn.lower()}.{ln.lower()}.{roll.lower()}@vit.edu.in"
            sql.append(f"INSERT INTO students (full_name, roll_number, email, division_id, is_active) VALUES ('{fn} {ln}', '{roll}', '{email}', (SELECT id FROM divisions WHERE division_name = '{div_name}' AND department = 'IT' LIMIT 1), true) ON CONFLICT (roll_number) DO NOTHING;")
            
    with open(f"/Users/yashodhanrajapkar/Documents/Projects/dlr-claude/it_year_{y}.sql", "w") as f:
        f.write("\n".join(sql))
