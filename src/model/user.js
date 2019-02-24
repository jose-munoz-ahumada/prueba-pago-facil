const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const Schema = mongoose.Schema;

var SchemaTypes = mongoose.Schema.Types;
const UserSchema = new Schema({
    Id: mongoose.Schema.Types.ObjectId,
    Nombre: {
        type: String,
        required: true
    },
    Apellido: {
        type: String,
        required: true
    },
    DocumentoIdentidad: {
        type: String,
        required: true
    },
    TipoDocumento: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    DOB: {
        type: String,
        required: true
    },
    Sexo: {
        type: String,
        required: true
    },
    NombreBanco: {
        type: String,
        required: true
    },
    NumeroCuenta: {
        type: String,
        required: true
    },
    TipoCuenta: {
        type: String,
        required: true
    },
    Comision: {
        type: SchemaTypes.Double,
        default: 0
    },
    Status: {
        type: String,
        default: 'PENDIENTE'
    }
});
module.exports = mongoose.model('user', UserSchema);