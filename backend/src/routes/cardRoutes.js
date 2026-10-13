const express = require('express');
const router = express.Router();
const upload = require('../config/multer'); // Multer config
const cardController = require('../controllers/cardController');
const path = require('path');
const fs = require('fs');

// POST /api/cards/scan - Extracts data, returns preview (No Excel save)
router.post('/scan', upload.array('card_images', 2), (req, res) => cardController.scanCard(req, res));

// POST /api/cards/save - Saves final user-edited data to Excel
router.post('/save', (req, res) => cardController.saveCard(req, res));

// GET /api/cards/download-excel - Downloads Excel database file
router.get('/download-excel', (req, res) => {
  const filePath = path.resolve(process.cwd(), 'business_cards.xlsx');
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'No Excel database created yet.' });
  }

  res.download(filePath, 'Business_Cards_Master.xlsx');
});

// GET /api/cards/users - Returns list of employees for assignment dropdown
router.get('/users', (req, res) => cardController.getUsers(req, res));

module.exports = router;