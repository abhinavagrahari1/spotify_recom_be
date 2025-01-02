const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const env = process.env.NODE_ENV || 'prod'; 
dotenv.config({ path: `.env.${env}`});

const recommendationRoutes = require('./routes/recommendation');
const authRoutes = require('./routes/auth');
const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(cors({ origin: `${process.env.BASE_URL}`,
credentials: true // Allow cookies to be sent
}));


app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/recommendation', recommendationRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



