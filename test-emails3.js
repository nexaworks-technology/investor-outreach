const XLSX = require('xlsx');
const inputPath = '/Users/sahil/Downloads/Global investors outreach.xlsx';
const workbook = XLSX.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;

function extractEmail(emailCol, emailsCol) {
  if (emailCol && typeof emailCol === 'string' && !emailCol.includes('[email protected]')) {
    const match = emailCol.match(emailRegex);
    if (match) return match[0];
  }
  if (emailsCol && typeof emailsCol === 'string') {
    const matches = emailsCol.match(emailRegex);
    if (matches) return matches[0];
  }
  return null;
}

let c = 0;
for (const row of data) {
  const e = extractEmail(row['Email'], row['emails']);
  if (e) c++;
}
console.log(c);
