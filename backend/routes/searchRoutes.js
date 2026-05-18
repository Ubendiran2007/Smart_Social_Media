const express = require('express');
const router = express.Router();
const { globalSearch, getTrendingHashtags } = require('../controllers/search/searchController');
const auth = require('../middleware/auth');

router.get('/', auth, globalSearch);
router.get('/trending', auth, getTrendingHashtags);

module.exports = router;
