const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Spotify callback
router.get('/callback', authController.spotifyCallback);

router.get('/get-spotify-token', authController.getSpotifyToken);

module.exports = router;