const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const router = express.Router();

// Recommendation route
router.post('/recommend', recommendationController.recommend);


module.exports = router;