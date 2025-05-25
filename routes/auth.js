const express = require('express');
const Asset = require(__dirname + './../models/assetModel');
const Usuario = require(__dirname + './../models/usuario');
const upload = require(__dirname + './../utils/uploadFile');
const commons = require(__dirname + './../utils/common');
const token = require(__dirname + './../utils/token');
const TokenHelper = require(__dirname + './../utils/token');

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

let router = express.Router();

router.post('/register', async (req, res) => {
    let pathFoto = `http://${req.hostname}:8080/usuarios/`;
    if (req.body.password && req.body.nombre_completo && req.body.email) {
        pathFoto += upload.storage(req.body.foto, 'usuarios');
        let newUser = new Usuario({
            nombre_completo: req.body.nombre_completo,
            email: req.body.email,
            categoria: req.body.categoria,
            password: req.body.password,
            foto: pathFoto
        });
        newUser.save().then(x => {
            res.status(201).send({
                resultado: x
            });
        }).catch(err => {
            console.log(err)
            commons.deleteImagen('usuarios/' + pathFoto);
            commons.checkErrors(err, res);
        });

    } else {
        res.status(400).send({
            ok: false, error: 'Los campos email, nombre, apellidos y contraseña son obligatorios'
        });
    }
});

router.post('/login', (req, res) => {
    Usuario.findOne({
        email: req.body.email
    }).then(x => {
        if (x && req.body.password === x.password) {

            res.status(200).send({
                token: token.generarToken(x),
                nombre: x.nombre_completo
            });


        } else {
            res.status(401).send({
                error: 'Email o constraseña incorrecta'
            });
        }

    }).catch(err => {
        res.status(500).send({
            error: 'Error al loguearse'
        });
    })
});


router.get('/validate', async (req, res) => {
    try {
        let userToken = token.validarToken(req.headers['authorization'].split(' ')[1]);
        let userLogueado = await Usuario.findById(userToken.id);
        if (userLogueado) {
            res.status(200).send();
        } else {
            res.status(401).send();
        }

    } catch (err) {
        res.status(401).send();
    }
});
router.get('/me', auth, async (req, res) => {
    try {
        const user = await Usuario.findById(req.user.id);

        if (!user) {
            return res.status(404).send({ error: "Usuario no encontrado" });
        }
        res.status(200).send({
            resultado: {
                nombre_completo: user.nombre_completo,
                email: user.email,
                password: user.password
            }
        });
    } catch (err) {
        res.status(500).send({ error: err.message || "Error al obtener el usuario" });
    }
});

router.get('/download-list', auth, async (req, res) => {
    try {
        const user = await Usuario.findById(req.user.id);

        if (!user) {
            return res.status(404).send({ error: "Usuario no encontrado" });
        }
        res.status(200).send({
            resultado: {
                downloaded_assets: user.downloaded_assets,
            }
        });
    } catch (err) {
        res.status(500).send({ error: err.message || "Error al obtener el usuario" });
    }
});


router.post('/validate/password', async (req, res) => {
    try {
        const result = await bcrypt.desincriptar(req.body.password_check, req.body.password);
        res.send({ resultado: result })
    } catch (err) {
        res.status(500).send();
    }

});

router.post('/changeName', auth, async (req, res) => {
    try {
        Usuario.findByIdAndUpdate(
            req.user.id,
            { $set: { nombre_completo: req.body.newName } },
            { new: true }
        )
            .then(updatedUser => {
                res.status(200).send({ resultado: updatedUser });
            })
            .catch(err => {
                res.status(500).send({ error: err.message || "No se pudo actualizar el nombre completo" });
            });
    }
    catch (err) {
        res.status(401).send();
    }
});
// Cambiar correo
router.post('/changeEmail', auth, async (req, res) => {
    try {
        Usuario.findByIdAndUpdate(
            req.user.id,
            { $set: { email: req.body.newEmail } },
            { new: true }
        )
            .then(updatedUser => {
                res.status(200).send({ resultado: updatedUser });
            })
            .catch(err => {
                res.status(500).send({ error: err.message || "No se pudo actualizar el email" });
            });
    }
    catch (err) {
        res.status(401).send();
    }
});

// Cambiar contraseña
router.post('/changePass', auth, async (req, res) => {
    try {
        const newPassword = req.body.newPass;
        if (!newPassword) {
            return res.status(400).send({ error: "Falta la nueva contraseña" });
        }

        Usuario.findByIdAndUpdate(
            req.user.id,
            { $set: { password: newPassword } },
            { new: true }
        )
            .then(updatedUser => {
                res.status(200).send({ resultado: "Contraseña actualizada correctamente" });
            })
            .catch(err => {
                res.status(500).send({ error: err.message || "No se pudo actualizar la contraseña" });
            });
    }
    catch (err) {
        res.status(401).send();
    }
});


module.exports = router;