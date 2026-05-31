import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Path to public/contacts.csv
    const filePath = path.join(process.cwd(), 'public', 'contacts.csv');

    // CSV Headers
    const headers = 'Date,Name,Email,Message\n';
    
    // Check if file exists, if not create it with headers
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, headers, 'utf8');
    }

    // Escape fields for CSV format to make sure Excel handles commas and quotes correctly
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      str = str.replace(/"/g, '""');
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str}"`;
      }
      return str;
    };

    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const csvRow = `${escapeCsv(dateStr)},${escapeCsv(name)},${escapeCsv(email)},${escapeCsv(message)}\n`;

    // Append the new row to the CSV file
    fs.appendFileSync(filePath, csvRow, 'utf8');

    // If Google Sheets URL is set in environment, sync it there too!
    const googleSheetsUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL;
    if (googleSheetsUrl) {
      try {
        const response = await fetch(googleSheetsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        });
        const resText = await response.text();
        console.log('Google Sheets Sync Status:', response.status);
        console.log('Google Sheets Sync Response:', resText.substring(0, 500));
      } catch (err) {
        console.error('Failed to sync to Google Sheets:', err);
      }
    }

    return NextResponse.json({ success: true, message: 'Message recorded successfully' });
  } catch (error) {
    console.error('Error writing contact to CSV:', error);
    return NextResponse.json({ error: 'Failed to record message' }, { status: 500 });
  }
}
