const XLSX = require('xlsx');
const inputPath = '/Users/sahil/Downloads/Global_AI_Investor_Contact_Database_2026.xlsx';
const workbook = XLSX.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(Object.keys(data[0] || {}));
console.log(data.length);
