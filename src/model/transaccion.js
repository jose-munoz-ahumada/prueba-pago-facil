const mongoose = require('mongoose')
require('mongoose-double')(mongoose);
const Schema = mongoose.Schema;
const TransaccionSchema = new Schema({
    IdTrx: {
        type: String,
        required: true,
        unique: true
    },
    Monto: {
        type: Number,
        required: true
    },
    TipoMoneda: {
        type: String,
        required: true
    },
    Detalle: {
        type: String,
        required: true
    },
    Comercio: {
        type: String,
        required: true
    },
    IdReferidor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    FechaTransaccion: {
        type: Date,
        required: true
    },
    Pagada: {
        type: String,
        default: 'N'
    }
});
module.exports = mongoose.model('transaccion', TransaccionSchema);