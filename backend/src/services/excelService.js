const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelService {
  constructor() {
    // Saves business_cards.xlsx deterministically in the running project folder
    this.filePath = path.resolve(process.cwd(), 'business_cards.xlsx');
  }

  async appendCardRecord(contactData, processedBy) {
    try {
      console.log(`[ExcelService] Using database file: ${this.filePath}`);
      
      const workbook = new ExcelJS.Workbook();
      let worksheet;

      const fileExists = fs.existsSync(this.filePath);

      if (fileExists) {
        console.log('[ExcelService] Reading existing business_cards.xlsx...');
        await workbook.xlsx.readFile(this.filePath);
        // Grab existing sheet or fallback to sheet index 0
        worksheet = workbook.worksheets[0] || workbook.getWorksheet('Business Cards');
      } 

      if (!fileExists || !worksheet) {
        console.log('[ExcelService] Creating new Excel file: business_cards.xlsx');
        worksheet = workbook.addWorksheet('Business Cards');
        this._setupHeaders(worksheet);
      }

      const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      // Append new row as an array to prevent column key mapping drops
      worksheet.addRow([
        timestamp,
        contactData.full_name || 'N/A',
        contactData.company_name || 'N/A',
        contactData.email || 'N/A',
        contactData.phone || 'N/A',
        contactData.website || 'N/A',
        contactData.address || 'N/A',
        processedBy
      ]);

      await workbook.xlsx.writeFile(this.filePath);
      console.log(`[ExcelService Success]: Record appended! Total rows: ${worksheet.rowCount - 1}`);

    } catch (error) {
      if (error.code === 'EBUSY' || error.code === 'EPERM') {
        console.error('[ExcelService Warning]: File is locked by Excel. Please close business_cards.xlsx.');
      } else {
        console.error('[ExcelService Error]: Failed to write to Excel:', error.message);
      }
    }
  }

  _setupHeaders(worksheet) {
    worksheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 22 },
      { header: 'Full Name', key: 'full_name', width: 25 },
      { header: 'Company Name', key: 'company_name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Website', key: 'website', width: 22 },
      { header: 'Address', key: 'address', width: 45 },
      { header: 'Processed By', key: 'processed_by', width: 20 }
    ];
    worksheet.getRow(1).font = { bold: true };
  }
}

module.exports = new ExcelService();