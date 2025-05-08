const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

//Enrutadores
const auth = require(__dirname + '/routes/auth');

mongoose.connect('mongodb+srv://admin:UA.2025@cluster0.8pf4i7b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/bck-UA');



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