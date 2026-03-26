
import XLSX from 'xlsx';
import fs from 'fs';

const files = [
  'BE Sem VIII Attendance List AY 2025-26.xlsx',
  'SE Sem-IV Attendance List AY 2025-26.xlsx',
  'TE Sem-VI Attendance List AY 2025-26.xlsx'
];

files.forEach(file => {
  console.log(`\n--- File: ${file} ---`);
  if (!fs.existsSync(file)) {
    console.log('File not found');
    return;
  }
  const workbook = XLSX.readFile(file);
  const sheetNames = workbook.SheetNames;
  
  sheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet['!ref']) return;
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`\nSheet: ${sheetName}`);
    
    // Look for the row containing Student Name or Roll No
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(data.length, 20); i++) {
        const row = data[i];
        if (row && row.some(cell => typeof cell === 'string' && (cell.toLowerCase().includes('roll') || cell.toLowerCase().includes('name')))) {
            headerRowIndex = i;
            break;
        }
    }
    
    if (headerRowIndex !== -1) {
        console.log(`Found header at row ${headerRowIndex + 1}:`, data[headerRowIndex]);
        // Also print the next 2 rows (sample students)
        for (let i = headerRowIndex + 1; i < Math.min(data.length, headerRowIndex + 5); i++) {
            console.log(`Data row ${i + 1}:`, data[i]);
        }
    } else {
        console.log(`Could not find header row in first 20 rows of sheet ${sheetName}`);
    }
  });
});
