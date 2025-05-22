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
            res.status(401);
            res.json({
                result: 'KO',
                message: response.message
            });
        });
}

router.post('/subir', auth, async (req, res) => {


    let pathFoto = `http://${req.hostname}/assets/`;

    pathFoto += upload.storage(req.body.asset, 'assets');

    let pathFotoPort = `http://${req.hostname}/portadas/${upload.storage(req.body.portada, 'portadas')}`;
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
router.get('/like', auth, async (req, res) => {
    try {
        const { assetId } = req.query;
        console.log(req.query);
        const user = await Usuario.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ error: "Usuario no encontrado" });
        }
        const valor = user.rated_assets?.get ? user.rated_assets.get(assetId) : undefined;
        return res.status(200).send({ resultado: valor });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ error: err.message || "Error en la operación" });
    }
});

router.post('/like', auth, async (req, res) => {
    try {
        let isLiked = req.body.isLiked;
        let increment = isLiked ? 1 : -1;
        const assetId = req.body.id.toString();

        const user = await Usuario.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ error: "Usuario no encontrado" });
        }

        const ratedAssets = user.rated_assets;

        // Verifica si es un Map (como definiste en el esquema)
        let valor = ratedAssets?.get ? ratedAssets.get(assetId) : undefined;

        console.log("Valor en rated_assets:", ratedAssets);

        if (valor !== undefined) {
            if (valor !== isLiked) {
                increment *= 2;
            }
            if (valor === isLiked) {
                increment *= -1;
                isLiked = undefined;
            }
        }
        console.log("Id state:", valor, ":", increment);

        // Actualizar el usuario
        if (isLiked === undefined) {
            await Usuario.findByIdAndUpdate(
                req.user.id,
                { $unset: { [`rated_assets.${assetId}`]: "" } }
            );
        } else {
            await Usuario.findByIdAndUpdate(
                req.user.id,
                { $set: { [`rated_assets.${assetId}`]: isLiked } }
            );
        }

        // Actualizar el asset
        const updatedAsset = await Asset.findByIdAndUpdate(
            assetId,
            { $inc: { likes: increment } },
            { new: true }
        );

        if (!updatedAsset) {
            return res.status(404).send({ error: "Asset no encontrado" });
        }

        return res.status(200).send({ resultado: updatedAsset });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err.message || "Error en la operación" });
    }
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

router.get('/misAssets', auth, async (req, res) => {
    console.log("HUH?" + req.user.id);
    try {
        const assets = await Asset.find({ autor: req.user.id }).populate('autor');
        res.status(200).send({ resultado: assets });
    } catch (err) {
        console.error(err);
        res.status(501).send({ error: err.message || "No se pudieron obtener los assets" });
    }
});

router.post('/borrar-asset', auth, async (req, res) => {
    try {
        const assetId = req.body.id;

        if (!assetId) {
            return res.status(400).send({ error: 'Falta el id del asset' });
        }

        // Buscar el asset para comprobar que existe y que es del usuario
        const asset = await Asset.findById(assetId);

        if (!asset) {
            return res.status(404).send({ error: 'Asset no encontrado' });
        }

        if (asset.autor.toString() !== req.user.id) {
            return res.status(403).send({ error: 'No autorizado para borrar este asset' });
        }

        // Borrar asset
        await Asset.findByIdAndDelete(assetId);

        return res.status(200).send({ resultado: 'Asset borrado correctamente' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ error: err.message || 'Error al borrar el asset' });
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