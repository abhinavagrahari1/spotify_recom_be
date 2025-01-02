const axios = require('axios');

const getUserTopTracks = async (accessToken) => {
    try{
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data.items;
    }catch(error){
        console.log(error);
    }
};

module.exports = {
    getUserTopTracks
};