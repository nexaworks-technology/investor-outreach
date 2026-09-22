const XLSX = require('xlsx');
const inputPath = '/Users/sahil/Downloads/Global investors outreach.xlsx';
const workbook = XLSX.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

let samples = [];
for (const row of data) {
  const e1 = row['Email'] || '';
  const e2 = row['emails'] || '';
  
  if (e1.includes('[email protected]') || e1 === 'Not publicly available' || !e1) {
    if (e2 && e2 !== 'NO mail' && !e2.includes('Not publicly available')) {
      samples.push(e2);
    }
  } else if (e1 && e1 !== 'Not publicly available' && !e1.includes('[email protected]')) {
    samples.push(e1);
  }
}
console.log(samples.slice(0, 10));
