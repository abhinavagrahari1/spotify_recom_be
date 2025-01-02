const jwt = require('jsonwebtoken');
const axios = require('axios');

const getSpotifyToken = (req, res) => {
    const accessToken = req.cookies.spotifyAccessToken;
    res.json({ accessToken });
};

// Spotify callback
const spotifyCallback = async(req, res) => {
    const code = req.query.code;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = `${process.env.BASE_URL}/auth/callback`; // Replace with your redirect URI
    console.log('code :>> ', code);

    try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log('tokenResponse :>> ', tokenResponse);
        const { access_token, refresh_token } = tokenResponse.data;

        // Verify user in Spotify and register in your database
        const userProfileResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        console.log('userProfileResponse :>> ', userProfileResponse.data);

        res.cookie('spotifyAccessToken', access_token, { httpOnly: true});
        res.redirect(`${process.env.BASE_URL}/recommendations`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    spotifyCallback,
    getSpotifyToken
};


