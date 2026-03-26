
import XLSX from 'xlsx';
import fs from 'fs';

const files = [
  { path: 'BE Sem VIII Attendance List AY 2025-26.xlsx', sem: 8, prefix: 'INFT-8' },
  { path: 'SE Sem-IV Attendance List AY 2025-26.xlsx', sem: 4, prefix: 'INFT-4' },
  { path: 'TE Sem-VI Attendance List AY 2025-26.xlsx', sem: 6, prefix: 'INFT-6' }
];

let sql = `
-- ============================================================
-- AUTO-GENERATED STUDENT SEED
-- ============================================================

BEGIN;

-- Delete existing attendance linked to students, and students
TRUNCATE public.attendance CASCADE;
TRUNCATE public.students CASCADE;

DO $$ 
DECLARE
  v_div_id UUID;
BEGIN
`;

files.forEach(fileObj => {
  if (!fs.existsSync(fileObj.path)) return;
  const workbook = XLSX.readFile(fileObj.path);
  const sheetNames = workbook.SheetNames;
  
  sheetNames.forEach(sheetName => {
    // Only process division sheets like "SE A", "TE B", "BE B"
    const match = sheetName.trim().match(/^[A-Z]{2}\s+([A-Z])$/i);
    if (!match) return; // skip other sheets if any
    
    const divLetter = match[1].toUpperCase();
    const divCode = `${fileObj.prefix}-${divLetter}`;
    
    // Get division ID dynamically
    sql += `\n  -- Division: ${divCode}\n`;
    sql += `  SELECT id INTO v_div_id FROM public.divisions WHERE division_name = '${divCode}' LIMIT 1;\n`;
    sql += `  IF v_div_id IS NOT NULL THEN\n`;

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet['!ref']) return;
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(data.length, 20); i++) {
        const row = data[i];
        if (row && row.some(cell => typeof cell === 'string' && (cell.toLowerCase().includes('roll') || cell.toLowerCase().includes('name')))) {
            headerRowIndex = i;
            break;
        }
    }
    
    if (headerRowIndex !== -1) {
        let currentBatch = 1;
        for (let i = headerRowIndex + 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;
            
            // Check if row indicates batch change
            if (row[0] && typeof row[0] === 'string' && row[0].toLowerCase().includes('batch')) {
                const batchMatch = row[0].match(/batch\s*(\d)/i);
                if (batchMatch) {
                    currentBatch = parseInt(batchMatch[1], 10);
                }
                continue;
            }
            
            // Expected columns: Sr No, Roll No, Name
            const rollNo = row[1];
            const name = row[2];
            
            if (rollNo && name && typeof rollNo === 'string') {
                const escapedName = name.replace(/'/g, "''").trim();
                const escapedRoll = rollNo.trim();
                sql += `    INSERT INTO public.students (division_id, roll_number, full_name, batch_number, is_active) VALUES (v_div_id, '${escapedRoll}', '${escapedName}', ${currentBatch}, true);\n`;
            }
        }
    }
    
    sql += `  END IF;\n`;
  });
});

sql += `
END $$;
COMMIT;
`;

fs.writeFileSync('real_students_seed.sql', sql);
console.log('real_students_seed.sql created with all parsed students.');
