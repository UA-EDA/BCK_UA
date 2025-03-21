const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

//Enrutadores
const auth = require(__dirname + '/routes/auth');

mongoose.connect('mongodb://localhost:27017/bck-ua');



const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allowed by CORS'));
        }
    }
}


let app = express();
app.use(logger('dev')); 
app.use(express.json({ limit: '25mb' }));

app.use(express.urlencoded({ limit: '25mb' }));
app.use('/auth', auth);

app.use(cors());
app.options('*', cors(corsOptions));


app.listen(8080);