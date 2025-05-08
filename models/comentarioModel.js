const mongoose = require('mongoose');


let ComentarioSchema = new mongoose.Schema({
    autor: {
        require: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuarios'
    },

    comentario: {
        require: true,
        type: String,
        trim: true
    }
});

module.exports = ComentarioSchema;