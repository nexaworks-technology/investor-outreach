const XLSX = require('xlsx');

const workbook = XLSX.readFile('/Users/sahil/Downloads/Global investors outreach.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log("Headers:");
console.log(Object.keys(data[0] || {}));

console.log("\nSample Data (first 2 rows):");
console.log(JSON.stringify(data.slice(0, 2), null, 2));

console.log(`\nTotal rows: ${data.length}`);
