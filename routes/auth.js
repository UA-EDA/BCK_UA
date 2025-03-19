const express = require('express');
const Usuario = require(__dirname + './../models/usuario');
const upload = require(__dirname + './../utils/uploadFile');
const commons = require(__dirname + './../utils/common');
const token = require(__dirname + './../utils/token');



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
        if (x) {
            bcrypt.desincriptar(req.body.password, x.password).then(bool => {
                if (bool === true) {
                    res.status(200).send({
                        token: token.generarToken(x)
                    });
                } else {
                    res.status(401).send({
                        error: 'Contraseña incorrecta'
                    });
                }
            });
        } else {
            res.status(401).send({
                error: 'No se ha encontrado el usuario con el email: ' + req.body.email
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

router.post('/validate/password', async (req, res) => {
    try{
        const result = await bcrypt.desincriptar(req.body.password_check, req.body.password);
        res.send({resultado : result})
    }catch(err){
        res.status(500).send();
    }
    
})

module.exports = router;