const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();

const recommendationRoutes = require('./routes/recommendation');
const authRoutes = require('./routes/auth');
const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [`${process.env.BASE_URL_PROD_FE}`, `${process.env.BASE_URL_FE}`]

app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => { // Check if origin is in the allowedOrigins list  
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // Allow cookies to be sent
}));


app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/recommendation', recommendationRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



