const express = require('express');
const router = express.Router();
const { analyzeText, getSuggestions } = require('../../controllers/ai/aiController');
const auth = require('../../middleware/auth');

router.post('/analyze', auth, analyzeText);
router.post('/suggestions', auth, getSuggestions);

module.exports = router;
