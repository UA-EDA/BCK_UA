const mongoose = require('mongoose');

let UsuarioSchema = new mongoose.Schema({
    nombre_completo: {
        require: true,
        type: String,
        trim: true,
    },

    email: {
        require: true,
        type: String,
        trim: true,
        match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        unique: true
    },

    password: {
        require: true,
        type: String,
        trim: true,
        min: 8
    },

    foto: {
        require: true,
        type: String,
        trim: true
    },

    rol: {
        require: true,
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER'
    },

    rated_assets: {
        type: Map,
        of: Boolean,
        default: {}
    },

    downloaded_assets: {
        type: Map,
        of: Boolean,
        default: {}
    }

});


let Usuario = mongoose.model('usuarios', UsuarioSchema);
module.exports = Usuario;