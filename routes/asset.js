const express = require('express');
const mongoose = require('mongoose');
const Asset = require(__dirname + './../models/assetModel');
const upload = require(__dirname + './../utils/uploadFile');

let router = express.Router();


router.post('/subir', async (req, res) => {

    let pathFoto = `http://${req.hostname}:8080/assets/`;

    pathFoto += upload.storage(req.body.asset, 'assets');

    let newAsset = new Asset({
        nombre: req.body.nombre,
        archivo: pathFoto,
        descripcion: req.body.descripcion,
        categorias: req.body.categorias,
        tipo: req.body.tipo,
        fecha_alta: new Date(),
        autor: new mongoose.Types.ObjectId(req.body.autor)
    });

    newAsset.save().then(x => {
        res.status(201).send({
            resultado: x
        });
    }).catch(err => {
        console.log(err);
        commons.deleteImagen('usuarios/' + pathFoto);
    });



});

router.get('/populares', (req, res) => {

    try {

        Asset.find();

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Algo ha ido mal obteniendo los datos' });
    }
});

router.get('/filtro/:categoria', (req, res) => {

    try {

        Asset.find({ categorias: req.params['categoria'] }).exec().then(x => {
            res.send({ resultado: x });
        }).catch(err => {
            console.log(err);
            res.status(500).send({
                error: 'No se han podido obtener los partidos'
            });
        });;

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Algo ha ido mal obteniendo los datos' });
    }
});

module.exports = router;