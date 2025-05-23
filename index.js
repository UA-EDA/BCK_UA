const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

//Enrutadores
const auth = require(__dirname + '/routes/auth');
const asset = require(__dirname + '/routes/asset');

mongoose.connect('mongodb+srv://admin:UA.2025@cluster0.8pf4i7b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/bck-UA');



let app = express();


app.use(
    cors({
        origin: ["https://asset-lab.netlify.app", "http://localhost:3000"], // Permite solo tu app de React
        methods: ["GET", "POST", "PUT", "DELETE"], // Métodos permitidos
        allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
        credentials: true, // Si usas cookies o autenticación con tokens
    })
);


app.use(logger('dev'));
app.use(express.json({ limit: '250mb' }));

app.use(express.static(__dirname + '/uploads'));

app.use(express.urlencoded({ limit: '250mb' }));
app.use('/auth', auth);
app.use('/asset', asset);



app.listen(8080);