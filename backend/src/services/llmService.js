const axios = require('axios');

class LLMService {
  constructor() {
    this.endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash-lite:generateContent';
  }

  /**
   * Helper method to get active API keys from environment variables
   */
  getApiKeys() {
    const keys = [
      process.env.GEMINI_API_KEY_PRIMARY || process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_BACKUP
    ].filter(Boolean); // Filter out undefined or empty values

    return keys;
  }

  async parseCardWithVision(files) {
    const apiKeys = this.getApiKeys();

    if (apiKeys.length === 0) {
      throw new Error('No Gemini API keys (GEMINI_API_KEY or GEMINI_API_KEY_BACKUP) found in environment variables.');
    }

    // Format file buffers as inline base64 image objects
    const imageParts = files.map(file => ({
      inline_data: {
        mime_type: file.mimetype,
        data: file.buffer.toString('base64')
      }
    }));

    const promptText = `
      You are an expert business card OCR system.
      Examine the provided business card image(s) (front/back).
      Important: 
      - If multiple phone numbers are present (e.g., Mobile, Office, WhatsApp), collect ALL of them and join them with commas into the "phone" string field.
      - If multiple emails are present, join them with commas as well.
      
      Extract all contact details into this exact JSON format:
      {
        "contact": {
          "full_name": string or null,
          "company_name": string or null,
          "email": string or null,
          "phone": string or null,
          "website": string or null,
          "address": string or null
        }
      }
      
      Rules:
      1. Clean up stray symbols or typos.
      2. If front and back images are provided, merge details into a single contact object.
      3. Set any field absent on the card to null.
      4. Ensure company name and person full name are strictly distinguished.
    `;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            ...imageParts
          ]
        }
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.1
      }
    };

    let lastError = null;

    // Iterate through key pool (Primary -> Backup)
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      const keyLabel = i === 0 ? 'Primary Key' : `Backup Key #${i}`;

      try {
        console.log(`[LLMService] Executing Vision LLM request using ${keyLabel}...`);

        const response = await axios.post(this.endpoint, requestBody, {
          params: { key: apiKey },
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10-second timeout
        });

        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error('Gemini API returned an unexpected or empty payload structure.');
        }

        console.log(`[LLMService Success]: Extraction completed using ${keyLabel}!`);
        return JSON.parse(rawText);

      } catch (error) {
        lastError = error;

        if (error.response) {
          console.warn(`[LLMService ${keyLabel} HTTP Error]: Status ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          console.warn(`[LLMService ${keyLabel} Network Error]: No response received from endpoint.`);
        } else {
          console.warn(`[LLMService ${keyLabel} Runtime Error]: ${error.message}`);
        }

        console.log(`[LLMService]: Attempting key failover...`);
      }
    }

    // Throw error if all available keys fail
    console.error('[LLMService Error]: All API key attempts in pool failed.');
    if (lastError?.response) {
      throw new Error(`Gemini API Error (${lastError.response.status}): ${JSON.stringify(lastError.response.data)}`);
    } else if (lastError?.request) {
      throw new Error('Gemini API failed to respond across all API keys. Check network connectivity.');
    } else {
      throw lastError || new Error('LLM Vision extraction failed across all configured API keys.');
    }
  }
}

module.exports = new LLMService();