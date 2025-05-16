const express = require('express');
const mongoose = require('mongoose');
const Asset = require(__dirname + './../models/assetModel');
const Usuario = require(__dirname + './../models/usuario');
const upload = require(__dirname + './../utils/uploadFile');
const TokenHelper = require(__dirname + './../utils/token');

let router = express.Router();

function auth(req, res, next) {
    // Comprobamos que han enviado el token tipo Bearer en el Header
    if (!req.headers.authorization) {
        return res.status(401).send({
            result: 'KO',
            message: 'Cabecera de autenticación tipo Bearer no encontrada [Authorization: Bearer jwtToken]'
        });
    };
    const token = req.headers.authorization.split(' ')[1]; // El formato es: Authorization: "Bearer JWT"
    // Comprobamos que han enviado el token
    if (!token) {
        return res.status(401).send({
            result: 'KO',
            message: 'Token de acceso JWT no encontrado dentro de la cabecera [Authorization: Bearer jwtToken]'
        });
    };
    // Verificamos que el token es correcto
    TokenHelper.decodificaToken(token)
        .then(user => {

            req.user = {
                id: user.id,
                token: token
            };
            return next();
        })
        .catch(response => {
            res.status(response.status);
            res.json({
                result: 'KO',
                message: response.message
            });
        });
}

router.post('/subir', auth, async (req, res) => {


    let pathFoto = `http://${req.hostname}:8080/assets/`;

    pathFoto += upload.storage(req.body.asset, 'assets');

    let pathFotoPort = `http://${req.hostname}:8080/portadas/${upload.storage(req.body.portada, 'portadas')}`;
    console.log(req.user.id)

    let newAsset = new Asset({
        nombre: req.body.nombre,
        archivo: pathFoto,
        descripcion: req.body.descripcion,
        categorias: req.body.categorias,
        tipo: req.body.tipo,
        fecha_alta: new Date(),
        portada: pathFotoPort,
        autor: new mongoose.Types.ObjectId(req.user.id)
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

router.post('/like', auth, async (req, res) => {
    const increment = req.body.isLiked ? 1 : -1;
    Usuario.findById(req.user.id)
        .then(user => {
            if (!user) throw new Error('Usuario no encontrado');

            // Obtener el valor en rated_assets[id], si no existe es undefined
            const valor = user.rated_assets?.[req.body.id.toString()];

            // Aquí puedes hacer lo que quieras con valor, o simplemente continuar
            console.log('Valor en rated_assets:', valor);
            if (valor != null) {
                if (valor == true && increment == 1) {
                    res.status(200).send({ resultado: "Ya ha valorado este asset positivamente" });
                }
                if (valor == false && increment == -1) {
                    res.status(200).send({ resultado: "Ya ha valorado este asset negativamente" });
                }
            }
        })
        .catch(err => {
            res.status(500).send({ error: err.message || "Error en la operación" });
        });
    Usuario.findByIdAndUpdate(
        req.user.id,
        { $set: { [`rated_assets.${req.body.id.toString()}`]: req.body.isLiked } },
        { new: true }
    )
        .catch(err => {
            res.status(500).send({ error: err.message || "No se pudo actualizar rated_assets" });
        });

    Asset.findByIdAndUpdate(
        req.body.id,
        { $inc: { likes: increment } },
        { new: true }
    )
        .then(updatedAsset => {
            res.status(200).send({ resultado: updatedAsset });
        })
        .catch(err => {
            res.status(500).send({ error: "No se ha podido actualizar el campo 'likes'" });
        });
});

router.post('/increment-download', auth, async (req, res) => {
    Asset.findByIdAndUpdate(
        req.body.id,
        { $inc: { num_descargas: 1 } },
        { new: true }
    )
        .then(updatedAsset => {
            res.status(200).send({ resultado: updatedAsset });
        })
        .catch(() => {
            res.status(500).send({ error: "No se pudo incrementar el número de descargas" });
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

        const cat = req.params.categoria;

        Asset.find({
            $or: [
                // Coincidencia exacta en el array o campo 'categorias'
                { categorias: cat },

                // Coincidencia exacta (o parcial con regex) en 'nombre'
                // Para búsqueda exacta:
                // { nombre: cat }

                // O para buscar que contenga la cadena (case-insensitive):
                { nombre: { $regex: cat, $options: 'i' } },

                // Ídem para 'tipo'
                { tipo: { $regex: cat, $options: 'i' } }
            ]
        })
            .populate('autor')
            .then(results => {
                res.send({ resultado: results });
            })
            .catch(err => {
                console.error(err);
                res.status(500).send({ error: 'No se han podido obtener los datos' });
            });

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Algo ha ido mal obteniendo los datos' });
    }
});

router.get('/:id', (req, res) => {
    Asset.findById(req.params['id']).populate('autor').then(x => {
        res.status(200).send({ resultado: x })

    }).catch(err => {
        res.status(500).send({
            error: "No se ha podido encontrar los datos"
        });
    });
});

router.get('/:nombre', (req, res) => {
    Asset.find({ categorias: req.params['nombre'] }).populate('autor').then(x => {
        res.send({ resultado: x });
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            error: 'No se han podido obtener los datos'
        });
    });;
});


router.get('/', (req, res) => {


    Asset.find().populate('autor').then(x => {
        res.send({ resultado: x });
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            error: 'No se han podido obtener los datos'
        });
    });;


});


module.exports = router;