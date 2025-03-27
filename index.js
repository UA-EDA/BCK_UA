const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

//Enrutadores
const auth = require(__dirname + '/routes/auth');

mongoose.connect('mongodb://localhost:27017/bck-ua');



let app = express();


app.use(
    cors({
        origin: "http://localhost:3000", // Permite solo tu app de React
        methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
        allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
        credentials: true, // Si usas cookies o autenticación con tokens
    })
);


app.use(logger('dev'));
app.use(express.json({ limit: '25mb' }));

app.use(express.urlencoded({ limit: '25mb' }));
app.use('/auth', auth);




app.listen(8080);