const XLSX = require('xlsx');
const inputPath = '/Users/sahil/Downloads/Global investors outreach.xlsx';
const workbook = XLSX.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

let countProtected = 0;
let countNoEmailAtAll = 0;
let countHasEmailButNotProtected = 0;

for (const row of data) {
  const e1 = row['Email'] || '';
  const e2 = row['emails'] || '';
  
  if (e1.includes('[email protected]') && !e2) {
    countProtected++;
  } else if (!e1 && !e2) {
    countNoEmailAtAll++;
  } else if (e1 === 'Not publicly available' && (e2 === 'NO mail' || !e2)) {
    countNoEmailAtAll++;
  } else {
    countHasEmailButNotProtected++;
  }
}
console.log(`Protected (Cloudflare obfuscated): ${countProtected}`);
console.log(`No email available: ${countNoEmailAtAll}`);
console.log(`Has some email data: ${countHasEmailButNotProtected}`);
