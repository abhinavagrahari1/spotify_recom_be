const axios = require('axios');
const { getUserTopTracks } = require('../utils/spotify');
const { Groq } = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Function to get a new access token
const getNewAccessToken = async () => {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
        params: {
            grant_type: 'client_credentials',
            scope: ['user-read-email', 'playlist-read-private', 'user-top-read']
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
        }
    });
    return response.data.access_token;
};

// Function to check if the access token is valid
const isAccessTokenValid = async (accessToken) => {
    try {
        await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return true;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return false;
        }
        throw error;
    }
};

// Recommendation logic
const recommend = async (req, res) => {
    let spotifyAccessToken = req.get('Spotify-Access-Token');
    console.log('spotifyAccessToken :>> ', spotifyAccessToken);

    try {
        const tokenIsValid = await isAccessTokenValid(spotifyAccessToken);
        if (!tokenIsValid) {
            console.log('Access token is invalid. Getting a new token...');
            spotifyAccessToken = await getNewAccessToken();
            console.log('New access token :>> ', spotifyAccessToken);
        }

        const topTracks = await getUserTopTracks(spotifyAccessToken);

        const trackNames = topTracks?.map(track => track.name).join(', ');
        console.log('trackNames :>> ', trackNames);
        const combinedPrompt = `Generate a list of the top ten songs from the following list and return the values in JSON format with "artist" and "title" as keys. Input song list: ${trackNames}`;

        const response = await groq.chat.completions.create({
            model: 'mixtral-8x7b-32768',
            messages: [{ role: 'user', content: combinedPrompt }],
        });

        console.log('object :>> ', response.choices[0].message.content);

        const firstIndex = response.choices[0].message.content.indexOf('[');
        const lastIndex = response.choices[0].message.content.lastIndexOf(']');

        if (firstIndex === -1 || lastIndex === -1) {
            return res.status(500).json({ error: 'Unable to extract JSON data from response with keys as artist and title' });
        }

        const jsonResponse = response.choices[0].message.content.substring(firstIndex, lastIndex + 1);

        const songRecommendations = JSON.parse(jsonResponse);

        console.log('songRecommendations :>> ', songRecommendations);

        const songLinks = await Promise.all(songRecommendations?.map(async (s) => {
            const searchResults = await axios.get('https://api.spotify.com/v1/search', {
                headers: {
                    'Authorization': `Bearer ${spotifyAccessToken}`
                },
                params: {
                    q: s.title,
                    type: 'track',
                    limit: 1 // Get only the top result
                }
            });

            const track = searchResults.data.tracks.items[0];
            return {
                name: track.name,
                spotifyLink: track.external_urls.spotify
            };
        }));

        return res.json({ message: songRecommendations, songs: songLinks });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    recommend
};
