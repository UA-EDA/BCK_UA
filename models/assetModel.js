const mongoose = require('mongoose');

const comentarioSchema = require('./comentarioModel');  // IMPORTAR schema, no modelo

let AssetSchema = new mongoose.Schema({
    nombre: {
        required: true,
        type: String,
        trim: true
    },
    archivo: {
        required: true,
        type: String,
        trim: true
    },
    portada: {
        required: true,
        type: String,
        trim: true
    },
    categorias: {
        type: [String],
        required: true,
        validate: {
            validator: function (arr) {
                return Array.isArray(arr) && arr.length > 0;
            },
            message: 'Debe contener al menos una categoría.'
        }
    },
    tipo: {
        required: true,
        type: String,
        enum: ['3D', '2D', 'AUDIO', 'VIDEO', 'SCRIPT', 'IMAGE'],
        default: 'USER'
    },
    fecha_alta: {
        required: true,
        type: Date
    },
    descripcion: {
        required: true,
        type: String
    },
    autor: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuarios'
    },
    comentarios: {
        type: [comentarioSchema],
        default: []
    },
    likes: {
        type: Number,
        default: 0
    },
    num_descargas: {
        type: Number,
        default: 0
    }
});

let Asset = mongoose.model('assets', AssetSchema);
module.exports = Asset;
