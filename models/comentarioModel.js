const mongoose = require('mongoose');

const UsuarioSchema = require('./usuario');


let ComentarioSchema = new mongoose.Schema({
    autor: {
        require: true,
        type: UsuarioSchema
    },

    comentario: {
        require: true,
        type: String,
        trim: true
    }
});

module.exports = ComentarioSchema;