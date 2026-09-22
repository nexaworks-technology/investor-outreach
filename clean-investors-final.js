const XLSX = require('xlsx');
const fs = require('fs');

const inputPath = '/Users/sahil/Downloads/Global investors outreach.xlsx';
const outputPath = '/Users/sahil/Downloads/Global_Investors_Cleaned_For_Import.csv';

const workbook = XLSX.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

function extractEmail(emailCol, emailsCol) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  
  if (emailCol && typeof emailCol === 'string' && !emailCol.includes('[email protected]')) {
    const match = emailCol.match(emailRegex);
    if (match) return match[0];
  }
  
  if (emailsCol && typeof emailsCol === 'string') {
    const matches = emailsCol.match(emailRegex);
    if (matches && matches.length > 0) {
      return matches[0];
    }
  }
  return '';
}

function extractLinkedIn(emailsCol, siteOutreachCol) {
  const lnRegex = /(https?:\/\/(www\.)?linkedin\.com\/[^\s]+)/i;
  
  if (emailsCol && typeof emailsCol === 'string') {
    const match = emailsCol.match(lnRegex);
    if (match) return match[0];
  }
  if (siteOutreachCol && typeof siteOutreachCol === 'string') {
    const match = siteOutreachCol.match(lnRegex);
    if (match) return match[0];
  }
  return '';
}

const cleanedData = [];

for (const row of data) {
  const firmName = row['Name'] ? String(row['Name']).trim() : '';
  if (!firmName || firmName.toLowerCase() === 'investor name') continue; // Skip empty or header rows

  const email = extractEmail(row['Email'], row['emails']);
  const linkedin = extractLinkedIn(row['emails'], row['Site Outreach']);
  const website = row['Website'] && typeof row['Website'] === 'string' ? row['Website'].trim() : '';
  
  // Use firm name as Name if no specific partner name is available, just to satisfy the import requirements
  const contactName = "Team at " + firmName;
  
  cleanedData.push({
    "Name": contactName,
    "Firm": firmName,
    "Email": email,
    "Website": website,
    "LinkedIn": linkedin
  });
}

// Write to CSV
const outSheet = XLSX.utils.json_to_sheet(cleanedData);
const outWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(outWorkbook, outSheet, 'Investors');
XLSX.writeFile(outWorkbook, outputPath, { bookType: 'csv' });

console.log(`Successfully extracted ${cleanedData.length} investor records.`);
console.log(`Saved clean CSV to: ${outputPath}`);
