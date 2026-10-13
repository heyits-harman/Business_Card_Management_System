/**
 * API client service for Business Card Parser backend.
 */

const API_BASE = 'https://uninvited-prayer-disk.ngrok-free.dev/api/cards';

/**
 * Upload card image files (1 or 2) for OCR/LLM parsing.
 * @param {File[]} files - Up to 2 image files
 * @returns {Promise<{success: boolean, processed_by?: string, is_duplicate?: boolean, duplicate_info?: string, data?: object, error_code?: string, error?: string}>}
 */
export async function scanCardImages(files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('card_images', file);
  });

  const response = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || 'Failed to process card image(s).');
    error.code = data.error_code || 'SCAN_FAILED';
    throw error;
  }

  return data;
}

/**
 * Fetch list of team members for lead assignment dropdown.
 * @param {string} searchQuery - Optional search query string (q)
 * @returns {Promise<{success: boolean, count: number, users: Array<{id: string, name: string, email: string, role?: string}>}>}
 */
export async function fetchUsers(searchQuery = '') {
  const queryParam = searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : '';
  const response = await fetch(`${API_BASE}/users${queryParam}`);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch team members list.');
  }

  return data;
}

/**
 * Save verified/edited contact record into the Excel/Sheet database.
 * @param {object} payload - { processed_by: string, submitted_by: string, assigned_to: string, contact: object, force_submit?: boolean }
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function saveContactRecord(payload) {
  const response = await fetch(`${API_BASE}/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || 'Failed to save contact record.');
    error.code = data.error_code || (response.status === 409 ? 'DUPLICATE_CARD' : 'SAVE_FAILED');
    throw error;
  }

  return data;
}

/**
 * Trigger download of the master Excel file.
 */
export async function downloadExcelFile() {
  const response = await fetch(`${API_BASE}/download-excel`);
  if (!response.ok) {
    throw new Error('Failed to download Excel file. Make sure at least one record has been saved.');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', 'Business_Cards_Master.xlsx');
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

