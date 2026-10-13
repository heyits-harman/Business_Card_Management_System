class ParserService {
  extractRegexFields(rawText) {
    if (!rawText) return { email: null, website: null, phone: null };

    // Added global /g flag to capture ALL emails
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/gi;
    const websiteRegex = /(?:https?:\/\/|www\.)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i;
    const phoneRegex = /(?:\+?\d{1,3}[\s\.-]?)?\(?\d{2,5}\)?[\s\.-]?\d{3,5}[\s\.-]?\d{3,5}/g;

    // 1. Extract & deduplicate emails
    const emailMatches = rawText.match(emailRegex) || [];
    const uniqueEmails = [...new Set(emailMatches.map(e => e.trim().toLowerCase()))];

    // 2. Extract website
    let websiteMatch = rawText.match(websiteRegex);
    if (websiteMatch && /gmail|yahoo|hotmail|outlook/i.test(websiteMatch[0])) {
      websiteMatch = null;
    }

    // 3. Extract & deduplicate phone numbers
    let rawPhones = rawText.match(phoneRegex) || [];
    const uniquePhones = [];

    for (const p of rawPhones) {
      const cleanPhone = p.trim();
      const digitsOnly = cleanPhone.replace(/\D/g, '');
      
      // Keep valid numbers (8+ digits) and prevent exact duplicates
      if (digitsOnly.length >= 8 && !uniquePhones.some(existing => existing.replace(/\D/g, '') === digitsOnly)) {
        uniquePhones.push(cleanPhone);
      }
    }

    return {
      email: uniqueEmails.length > 0 ? uniqueEmails.join(', ') : null,
      website: websiteMatch ? websiteMatch[0] : null,
      phone: uniquePhones.length > 0 ? uniquePhones.join(', ') : null
    };
  }

  // Helper to check if a line is a contact detail header
  isContactLine(line) {
    const lower = line.toLowerCase();
    return (
      lower.includes('@') ||
      lower.includes('www.') ||
      lower.includes('http') ||
      /^[emwtf]\s*[\+\d]/i.test(line) ||
      /^(fax|telephone|phone|mobile|tel)\s*:/i.test(line)
    );
  }

  extractAddress(lines) {
    let addressLines = [];
    const addressIndicators = /\b(shop|building|bldg|tower|road|rd|street|st|sector|noida|mumbai|delhi|surat|pune|\d{6})\b/i;

    for (const line of lines) {
      if (this.isContactLine(line)) continue;

      if (addressIndicators.test(line)) {
        const cleaned = line.replace(/^[#;\s\\/—\-]+/, '').trim();
        if (cleaned.length > 5) {
          addressLines.push(cleaned);
        }
      }
    }

    return addressLines.length > 0 ? addressLines.join(', ') : null;
  }

  parseAndAssemble(mergedText, allWords = []) {
    const regexData = this.extractRegexFields(mergedText);

    // Clean OCR lines
    const cleanLines = mergedText
      .split('\n')
      .map(line => line.replace(/[^a-zA-Z0-9\s@\.\+\-,\(\)\:]/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(line => line.length > 2 && !line.startsWith('Side'));

    const address = this.extractAddress(cleanLines);

    // Dynamic Full Name Identification
    let fullName = null;
    const businessTerms = /\b(pvt|ltd|inc|corp|services|enterprises|building|tower|sector|sales|manager|director|deputy)\b/i;

    for (const line of cleanLines) {
      if (this.isContactLine(line) || /\d/.test(line) || businessTerms.test(line)) continue;
      if (address && address.includes(line)) continue;

      const words = line.split(' ');
      if (words.length >= 2 && words.length <= 4) {
        fullName = line;
        break;
      }
    }

    // Dynamic Company Name Identification
    let companyName = null;
    const companyKeywords = /\b(pvt|ltd|private|limited|inc|corp|corporation|industries|technologies|digital|exports|textiles)\b/i;

    for (let i = 0; i < cleanLines.length; i++) {
      const line = cleanLines[i];

      if (this.isContactLine(line) || line === fullName) continue;

      if (companyKeywords.test(line)) {
        if (i > 0 && !this.isContactLine(cleanLines[i - 1]) && cleanLines[i - 1] !== fullName && !/\d/.test(cleanLines[i - 1])) {
          companyName = `${cleanLines[i - 1]} ${line}`;
        } else {
          companyName = line;
        }
        break;
      }
    }

    // Fallback company name from domain if still null
    if (!companyName && regexData.email) {
      const firstEmail = regexData.email.split(',')[0].trim();
      const domain = firstEmail.split('@')[1]?.split('.')[0];
      if (domain && !['gmail', 'yahoo', 'hotmail', 'outlook'].includes(domain.toLowerCase())) {
        companyName = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    }

    return {
      contact: {
        full_name: fullName,
        company_name: companyName,
        email: regexData.email,
        phone: regexData.phone,
        website: regexData.website,
        address: address
      },
      meta: {
        raw_text: mergedText
      }
    };
  }
}

// Bind methods explicitly before exporting instance
const parserService = new ParserService();
parserService.parseAndAssemble = parserService.parseAndAssemble.bind(parserService);
parserService.extractAddress = parserService.extractAddress.bind(parserService);
parserService.isContactLine = parserService.isContactLine.bind(parserService);
parserService.extractRegexFields = parserService.extractRegexFields.bind(parserService);

module.exports = parserService;