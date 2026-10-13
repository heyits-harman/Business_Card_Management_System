const ocrService = require('../services/ocrService');
const parserService = require('../services/parserService');
const qualityService = require('../services/qualityService');
const imageFormatService = require('../services/imageFormatService');
const llmService = require('../services/llmService');
const sheetService = require('../services/googleSheetService');

// Mock User Records (In production, replace with DB fetch)
const MOCK_USERS = [
  { id: 'usr_1', name: 'Rahul Sharma', email: 'rahul@company.com' },
  { id: 'usr_2', name: 'Priya Verma', email: 'priya@company.com' },
  { id: 'usr_3', name: 'Amit Patel', email: 'amit@company.com' },
  { id: 'usr_4', name: 'Neha Gupta', email: 'neha@company.com' }
];

class CardController {

  // 1. SCAN ONLY: Parses image and returns extracted JSON preview
  async scanCard(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, error: 'Please upload at least one card image.' });
      }

      console.log(`[CardController] Scanning ${req.files.length} card image(s)...`);

      for (let i = 0; i < req.files.length; i++) {
        const normalized = await imageFormatService.normalizeImageBuffer(req.files[i]);
        req.files[i].buffer = normalized.buffer;
        req.files[i].mimetype = normalized.mimetype;
      }

      for (let i = 0; i < req.files.length; i++) {
        const preCheck = await qualityService.validateAndPrepareImage(req.files[i]);
        if (!preCheck.isValid) {
          return res.status(400).json({
            success: false,
            error_code: preCheck.status,
            error: `Image ${i + 1} failed quality check: ${preCheck.reason}`
          });
        }
      }

      const { mergedText, allWords } = await ocrService.processCardImages(req.files);
      const structuredData = parserService.parseAndAssemble(mergedText, allWords);
      const validationCheck = qualityService.validateOcrResult(structuredData);

      let finalData = structuredData;
      let processedBy = 'Local_OCR';

      if (!validationCheck.isValid) {
        console.log(`[CardController] Local OCR failed (${validationCheck.reason}). Triggering Gemini Fallback...`);
        try {
          finalData = await llmService.parseCardWithVision(req.files);
          processedBy = 'Gemini_Vision_LLM';
        } catch (llmError) {
          console.error('[CardController LLM Fallback Failed]:', llmError.message);
          console.log('[CardController]: Retaining Local OCR result as ultimate fallback.');
          // finalData remains structuredData from local OCR
        }
      }

      // Check if extracted card already exists in Google Sheets
      const dupCheck = await sheetService.checkDuplicate(
        finalData.contact?.email,
        finalData.contact?.phone
      );

      return res.status(200).json({
        success: true,
        processed_by: processedBy,
        is_duplicate: dupCheck.isDuplicate,
        duplicate_info: dupCheck.isDuplicate ? `Card with matching ${dupCheck.field} (${dupCheck.value}) already exists.` : null,
        data: finalData
      });

    } catch (error) {
      console.error('[CardController Scan Error]:', error);
      return res.status(500).json({ success: false, error: 'Failed to process card image(s).' });
    }
  }

  // 2. SAVE CARD: Validates duplicates, submitter, assignee, and appends to Google Sheets
  async saveCard(req, res) {
    try {
      const { contact, processed_by, submitted_by, assigned_to, force_submit } = req.body;

      if (!contact) {
        return res.status(400).json({ success: false, error: 'No contact data provided for saving.' });
      }

      // if (!submitted_by || submitted_by.trim() === '') {
      //   return res.status(400).json({ success: false, error: 'Please enter your name in "Submitted By".' });
      // }

      // Duplication Guard Layer
      if (!force_submit) {
        const dupCheck = await sheetService.checkDuplicate(contact.email, contact.phone);
        if (dupCheck.isDuplicate) {
          return res.status(409).json({
            success: false,
            error_code: 'DUPLICATE_CARD',
            error: `Duplicate Entry Detected: Card with ${dupCheck.field} '${dupCheck.value}' already exists in database.`
          });
        }
      }

      // Append record to Google Sheets
      await sheetService.appendCardRecord({
        contact,
        processed_by,
        submitted_by,
        assigned_to: assigned_to || 'Unassigned'
      });

      return res.status(200).json({
        success: true,
        message: 'Business card successfully saved and assigned!'
      });

    } catch (error) {
      console.error('[CardController Save Error]:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to save card record.' });
    }
  }

  // 3. GET /api/cards/users?q=rahul
  async getUsers(req, res) {
    try {
      const searchQuery = (req.query.q || req.query.search || '').trim();

      // Fetch live users directly from Google Sheets!
      const users = await sheetService.getUsers(searchQuery);

      return res.status(200).json({
        success: true,
        count: users.length,
        users: users
      });
    } catch (error) {
      console.error('[CardController getUsers Error]:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch users from database.' });
    }
  }
}

module.exports = new CardController();