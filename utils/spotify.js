const axios = require('axios');
const { Groq } = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


const getUserTopTracks = async (accessToken) => {
    try{
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data.items;
    }catch(error){
        console.log(error.message);
        
        const trackPrompt = `Generate a list of 10 random Bollywood songs and return the values in JSON format with "name" and "artist" as keys.`

        const response = await groq.chat.completions.create({
            model: 'mixtral-8x7b-32768',
            messages: [{ role: 'user', content: trackPrompt }],
        });

        const firstIndex = response.choices[0].message.content.indexOf('[');
        const lastIndex = response.choices[0].message.content.lastIndexOf(']');

        if (firstIndex === -1 || lastIndex === -1) { 
            return res.status(500).json({ error: 'Unable to extract JSON data from response with keys as name and title' }); 
        }

        const jsonResponse = response.choices[0].message.content.substring(firstIndex, lastIndex + 1);
        

        const topTracks= JSON.parse(jsonResponse);
        return topTracks;


    }
};

module.exports = {
    getUserTopTracks
};