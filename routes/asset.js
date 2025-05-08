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


router.put('/:id', (req, res) => {

    Asset.findByIdAndUpdate(req.params['id'], {
        $set: {
            nombre: req.body.nombre,
            archivo: pathFoto,
            descripcion: req.body.descripcion,
            categorias: req.body.categorias,
            tipo: req.body.tipo,
            fecha_alta: new Date(),
            autor: new mongoose.Types.ObjectId(req.body.autor)


        }
    }, {
        new: true
    }).then(x => {
        res.status(200).send({
            resultado: x
        });

    }).catch(() => {
        res.status(500).send({
            error: "No se ha encontrado al equipo"
        });
    });
});


router.get('/filtro/:categoria', (req, res) => {

    try {

        Asset.find({ categorias: req.params['categoria'] }).exec().then(x => {
            res.send({ resultado: x });
        }).catch(err => {
            console.log(err);
            res.status(500).send({
                error: 'No se han podido obtener los datos'
            });
        });;

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Algo ha ido mal obteniendo los datos' });
    }
});

router.get('/:id', (req, res) => {
    Asset.findById(req.params['id']).then(x => {
        res.status(200).send({ resultado: x })

    }).catch(err => {
        res.status(500).send({
            error: "No se ha podido encontrar los datos"
        });
    });
});

router.get('/:nombre', (req, res) => {
    Asset.find({ categorias: req.params['nombre'] }).exec().then(x => {
        res.send({ resultado: x });
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            error: 'No se han podido obtener los datos'
        });
    });;
});



module.exports = router;