const express = require('express');
const Asset = require(__dirname + './../models/assetModel');


let router = express.Router();


router.post('/subir', async (req, res) => {

    let pathFoto = `http://${req.hostname}:8080/usuarios/`;


});

router.get('/populares', (req, res) => {

    try {

        Asset.find();

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Algo ha ido mal obteniendo los datos' });
    }
});