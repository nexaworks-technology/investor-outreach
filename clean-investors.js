const XLSX = require('xlsx');
const fs = require('fs');

const inputPath = '/Users/sahil/Downloads/Global investors outreach.xlsx';
const outputPath = '/Users/sahil/Downloads/Clean_Global_Investors.csv';

const workbook = XLSX.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

function extractEmail(emailCol, emailsCol) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  
  // Ignore Cloudflare protected emails like [email protected]
  if (emailCol && !emailCol.includes('[email protected]')) {
    const match = emailCol.match(emailRegex);
    if (match) return match[0];
  }
  
  if (emailsCol) {
    const matches = emailsCol.match(emailRegex);
    if (matches && matches.length > 0) {
      // Return first valid email found in the text
      return matches[0];
    }
  }
  return null;
}

const cleanedData = [];

for (const row of data) {
  const firmName = row['Name'] || '';
  const email = extractEmail(row['Email'], row['emails']);
  const website = row['Website'] || '';
  
  if (email && firmName) {
    cleanedData.push({
      "Name": "Team at " + firmName, // App requires a contact name, so we use "Team at Firm"
      "Firm": firmName,
      "Email": email,
      "Website": website
    });
  }
}

// Write to CSV
const outSheet = XLSX.utils.json_to_sheet(cleanedData);
const outWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(outWorkbook, outSheet, 'Investors');
XLSX.writeFile(outWorkbook, outputPath, { bookType: 'csv' });

console.log(`Successfully extracted ${cleanedData.length} valid investor records out of ${data.length} total rows.`);
console.log(`Saved clean CSV to: ${outputPath}`);
