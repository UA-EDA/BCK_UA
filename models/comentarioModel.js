const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comentarioSchema = new Schema({
  autor: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true },
  comentario: { type: String, required: true },
  valoracion: { type: Number, required: true }
}, { timestamps: true });

module.exports = comentarioSchema;
