const {body} = require('express-validator/check');
const Transaccion = require('../model/transaccion');
const User = require('../model/user');

const validationHandler = next => result => {
    if (result.isEmpty()) return true;
    let jsonResponse = [];
    result.array().map(i => jsonResponse.push(`El ${i.param} ${i.msg}`));
    return !next ? jsonResponse : next(jsonResponse);
};

const usuarioExiste = async (id) => {
    try {
        return await User.findById(id, {});
    } catch (e) {
        return false;
    }
};


exports.validate = (method) => {
    switch (method) {
        case 'registrarTransaccion': {
            return [
                body('Monto', 'Es requerido').exists(),
                body('TipoMoneda', 'Es requerido').exists(),
                body('Detalle', 'Es requerido').exists(),
                body('Comercio', 'Es requerido').exists(),
                body('IdReferidor', 'Es requerido').exists(),
                body('FechaTransaccion', 'Es requerido').exists()
            ]
        }
        case 'pagarTransaccion': {
            return [
                body('IdTrx', 'Es requerido').exists(),
                body('Monto', 'Es requerido').exists(),
                body('TipoMoneda', 'Es requerido').exists(),
                body('Detalle', 'Es requerido').exists(),
                body('Comercio', 'Es requerido').exists(),
                body('IdReferidor', 'Es requerido').exists(),
                body('FechaTransaccion', 'Es requerido').exists()
            ]
        }
    }
}

exports.list = (request, response) => {
    Transaccion.find({}, function (err, transacciones) {
        var transaccionesMap = {};
        transaccioness.forEach(function (transacciones) {
            transaccionesMap[transacciones._id] = transacciones;
        });
        response.send(transaccionesMap);
    });
};

exports.pagarTransaccion = async (request, response, next) => {
    const IdTrx = request.params.id;
    const transaccion = await Transaccion.findOne({IdTrx: IdTrx});
    // validamos si existe
    if (!transaccion)
        response.json({status: 'NOOK', 'error': `La transacción ${IdTrx} no existe`});
    if (transaccion.Pagada === 'Y')
        response.json({status: 'NOOK', 'error': `La transacción ${IdTrx} ya se encuentra pagada`});
    const updateTransaccion = await Transaccion.updateOne({IdTrx: IdTrx}, {$set: {Pagada: 'Y'}});
    response.json(updateTransaccion.ok == 1 ? {
        status: 'OK',
        Monto: transaccion.Monto,
        IdTrx: IdTrx
    } : {status: 'NOOK'});
};

exports.registrarTransaccion = (request, response, next) => {
    request
        .getValidationResult() // to get the result of above validate fn
        .then(validationHandler())
        .then(() => {
            const {IdTrx, Monto, TipoMoneda, Detalle, Comercio, IdReferidor} = request.body;
            let {FechaTransaccion} = request.body;
            const existeUsuario = usuarioExiste(IdReferidor);
            existeUsuario.then((user) => {
                if (!user)
                    response.json({status: 'NOOK', 'error': `El referidor ${IdReferidor} no existe`});
            });
            let timestamp = Date.parse(FechaTransaccion);
            if (isNaN(timestamp) == false) {
                let d = new Date(timestamp);
                FechaTransaccion = d.toISOString().slice(0, 10)
            }
            Transaccion.create({
                IdTrx,
                Monto,
                TipoMoneda,
                Detalle,
                Comercio,
                IdReferidor,
                FechaTransaccion
            })
                .then(() => {
                    response.json({status: 'OK', 'IdTrx': IdTrx});
                })
                .catch(error => {
                    console.log(error)
                    if (11000 === error.code || 11001 === error.code) {
                        response.json({status: 'NOOK', 'error': `El id ${idTrx} para la transacción ya existe`});
                    }
                    response.json({status: 'NOOK'});
                })
        })
        .catch(next, (result) => {
            //response.json({status: 'NOOK', 'errors' : result});
        })
};