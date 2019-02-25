const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
const Schema = mongoose.Schema;
/**
 * Definición de esquema de Tabla User,
 * Por una confusión en el texto del documento PDF de la prueba, dejé los campos como requeridos,
 * ya que aparecia que el MINIMO para el registro eran todos, pero en requeridos aparecian Menos
 */
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
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    },
    DOB: {
        type: String,
        default: 0
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

/**
 * Antes de guardar, Hash de password
 */
UserSchema.pre('save', function(next) {
    var user = this;
    // Si no se modificó la password, continuamos
    if (!user.isModified('Password')) return next();
    // Generamos HASH
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.Password, salt, function(err, hash) {
            if (err) return next(err);
            // Sobreescribimos Clave
            user.Password = hash;
            next();
        });
    });
});

/**
 * Metodo de compraración de contraseña, para validar contra Hash
 * @param candidatePassword
 * @param cb
 */
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.Password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('user', UserSchema);