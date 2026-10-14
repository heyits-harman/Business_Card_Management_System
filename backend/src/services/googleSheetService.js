const { google } = require('googleapis');
const path = require('path');

class SheetService {
  constructor() {
    this.spreadsheetId = process.env.SPREADSHEET_ID;
    
    this.auth = new google.auth.GoogleAuth({
      keyFile: path.resolve(process.cwd(), 'google-credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Checks if email or phone already exists in the Google Sheet
   */
  async checkDuplicate(email, phone) {
    if (!this.spreadsheetId) {
      console.warn('[SheetService Warning]: SPREADSHEET_ID is missing.');
      return { isDuplicate: false };
    }

    try {
      console.log(`[SheetService] Running Duplicate Check for Email: "${email}", Phone: "${phone}"`);

      // Fetch all rows (Skipping header Row 1)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A2:J',
      });

      const rows = response.data.values || [];
      console.log(`[SheetService] Fetched ${rows.length} existing rows from Google Sheets for comparison.`);

      const cleanPhoneDigits = (p) => (p && typeof p === 'string' ? p.replace(/\D/g, '') : '');
      const cleanEmail = (e) => (e && typeof e === 'string' ? e.trim().toLowerCase() : '');

      // Parse incoming email string into array of valid email items (handles commas)
      const targetEmails = (email || '')
        .split(',')
        .map(e => cleanEmail(e))
        .filter(e => e && e !== 'n/a' && e !== 'null' && e.includes('@'));

      // Parse incoming phone string into array of cleaned digit strings (handles commas)
      const targetPhones = (phone || '')
        .split(',')
        .map(p => cleanPhoneDigits(p))
        .filter(p => p && p !== 'n/a' && p.length >= 7);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // Safely access columns: Col F (index 5) = Email | Col G (index 6) = Phone
        const rawEmailCell = row.length > 5 ? row[5] : '';
        const rawPhoneCell = row.length > 6 ? row[6] : '';

        // Extract existing row items as arrays
        const existingEmails = (rawEmailCell || '')
          .split(',')
          .map(e => cleanEmail(e))
          .filter(e => e.length > 0);

        const existingPhones = (rawPhoneCell || '')
          .split(',')
          .map(p => cleanPhoneDigits(p))
          .filter(p => p.length >= 7);

        // 1. Check Email Duplicates (Any target email matching any existing email in row)
        for (const tEmail of targetEmails) {
          for (const eEmail of existingEmails) {
            if (tEmail === eEmail) {
              console.log(`[SheetService] Duplicate Match Found on Row ${i + 2}: Email '${tEmail}'`);
              return { isDuplicate: true, field: 'Email', value: tEmail };
            }
          }
        }

        // 2. Check Phone Duplicates (Any target phone matching any existing phone in row)
        for (const tPhone of targetPhones) {
          for (const ePhone of existingPhones) {
            if (ePhone === tPhone || ePhone.includes(tPhone) || tPhone.includes(ePhone)) {
              console.log(`[SheetService] Duplicate Match Found on Row ${i + 2}: Phone '${tPhone}'`);
              return { isDuplicate: true, field: 'Phone Number', value: tPhone };
            }
          }
        }
      }

      console.log('[SheetService] No duplicates found.');
      return { isDuplicate: false };

    } catch (error) {
      console.error('[SheetService Duplicate Check Error]:', error.message);
      return { isDuplicate: false }; // Non-blocking if API fails
    }
  }

  /**
   * Appends new verified card record to Google Sheets
   */
  async appendCardRecord(cardPayload) {
    if (!this.spreadsheetId) {
      throw new Error('SPREADSHEET_ID is missing from environment variables.');
    }

    const { contact, processed_by, submitted_by, assigned_to } = cardPayload;
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Helper function to force Google Sheets to treat phone numbers as plain text
    const formatPhoneForSheet = (phoneStr) => {
      if (!phoneStr) return 'N/A';
      
      // If string starts with '+', prefix with a single quote to force string type in Sheets
      return phoneStr.startsWith('+') ? `'${phoneStr}` : phoneStr;
    };

    // Order of columns in Google Sheet
    const rowValues = [
      timestamp,
      submitted_by || 'Anonymous',
      assigned_to || 'Unassigned',
      contact.full_name || 'N/A',
      contact.company_name || 'N/A',
      contact.email || 'N/A',
      formatPhoneForSheet(contact.phone),
      contact.website || 'N/A',
      contact.address || 'N/A',
      contact.keywords_slogans || 'N/A'
    ];

    const response = await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Sheet1!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowValues]
      }
    });

    console.log(`[SheetService Success]: Row appended at ${response.data.updates.updatedRange}`);
    return response.data;
  }

  /**
   * Fetches active user records from the "Users" sheet tab
   */
  async getUsers(searchQuery = '') {
    if (!this.spreadsheetId) return [];

    try {
      // Read all rows from the "Users" sheet tab (Skipping header row A1:D1)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A2:D',
      });

      const rows = response.data.values || [];

      // Map raw rows into structured user objects
      const users = rows.map((row, index) => ({
        id: row[0] || `usr_${index + 1}`,
        name: row[1] || 'Unknown User',
        email: row[2] || 'N/A',
        role: row[3] || 'Team Member'
      }));

      // Filter by search query if provided
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return users.filter(user => 
          user.name.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
        );
      }

      return users;
    } catch (error) {
      console.error('[SheetService getUsers Error]:', error.message);
      // Fallback empty list or non-blocking error handling
      return [];
    }
  }
}

module.exports = new SheetService();