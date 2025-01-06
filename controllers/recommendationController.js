const axios = require('axios');
const { getUserTopTracks } = require('../utils/spotify');
const { Groq } = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Recommendation logic
const recommend = async (req, res) => {
    const spotifyAccessToken = req.get('Spotify-Access-Token');
    console.log('spotifyAccessToken :>> ', spotifyAccessToken);
    try {
        const topTracks = await getUserTopTracks(spotifyAccessToken);
        
        console.log('topTracks :>> ', topTracks);
        const trackNames = topTracks?.map(track => track.name).join(', ');
        console.log('trackNames :>> ', trackNames);
        const combinedPrompt = `Find 10 new songs based on the user's favorite tracks: ${trackNames}, return them as list of objects with artist and title as keys`;

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
