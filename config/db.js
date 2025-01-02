const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URL).then(()=>{
            console.log("Mongodb connected");
        }).catch((error)=>{
            console.log(error);
        })
};

module.exports = connectDB;