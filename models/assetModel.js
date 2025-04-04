const mongoose = require('mongoose');
const UsuarioSchema = require('./usuario');
const ComentarioSchema = require('./comentarioModel');

let AssetSchema = new mongoose.Schema({
    nombre: {
        require: true,
        type: String,
        trim: true
    },

    archivo: {
        require: true,
        type: String,
        trim: true
    },

    categorias: {
        type: [String],
        require: true,
        validate: {
            validator: function (arr) {
                return Array.isArray(arr) && arr.length > 0;
            },
            message: 'Debe contener al menos una categoría.'
        }
    },

    tipo: {
        require: true,
        type: String,
        enum: ['3D', '2D', 'AUDIO', 'VIDEO', 'SCRIPT'],
        default: 'USER'
    },

    fecha_alta: {
        require: true,
        type: Date
    },

    descripcion: {
        require: true,
        type: String
    },
    

    autor: {
        require: true,
        type: UsuarioSchema
    },

    comentarios: {
        require: false,
        type: [ComentarioSchema]
    },

    likes: {
        require: false,
        type: Number
    },
    
    num_descargas: {
        require: false,
        type: Number
    }

});

let Asset = mongoose.model('assets', AssetSchema);
module.exports = Asset;