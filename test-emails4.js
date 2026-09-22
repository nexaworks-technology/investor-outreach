const XLSX = require('xlsx');
const inputPath = '/Users/sahil/Downloads/Global investors outreach.xlsx';
const workbook = XLSX.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;

let notMatched = [];
for (const row of data) {
  const e1 = row['Email'] || '';
  const e2 = row['emails'] || '';
  
  const hasData = (e1 && e1 !== 'Not publicly available' && !e1.includes('[email protected]')) ||
                  (e2 && e2 !== 'NO mail' && !e2.includes('Not publicly available'));
                  
  if (hasData) {
    if (!e1.match(emailRegex) && !e2.match(emailRegex)) {
      notMatched.push({ Name: row['Name'], e1, e2 });
    }
  }
}
console.log(`Not matched count: ${notMatched.length}`);
console.log(notMatched.slice(0, 5));
