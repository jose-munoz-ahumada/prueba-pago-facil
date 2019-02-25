const {body} = require('express-validator/check');
const Transaccion = require('../model/transaccion');
const User = require('../model/user');

/**
 * Handler de validador express, para retornar o no respuesta JSON
 * @param next
 * @returns {Function}
 */
const validationHandler = next => result => {
    if (result.isEmpty()) return true;
    let jsonResponse = [];
    result.array().map(i => jsonResponse.push(`${i.param}: ${i.msg}`));
    return !next ? jsonResponse : next(jsonResponse);
};

/**
 * Verifica si existe usuario, para poder registrarle o no una transacción
 * @param id
 * @returns {Promise<*>}
 */
const usuarioExiste = async (id) => {
    try {
        return await User.findById(id, {});
    } catch (e) {
        return false;
    }
};

/**
 * Definición de validación para registro de transacciones
 * @param method
 * @returns {ValidationChain[]}
 */
exports.validate = (method) => {
    switch (method) {
        case 'registrarTransaccion': {
            return [
                body('Monto', 'Debe ser un número').exists().isInt(),
                body('TipoMoneda', 'Es requerido').exists().isIn(['CLP'])
                    .withMessage('Actualmente este método solo recibe TipoMoneda CLP'),
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
};

/**
 * Método de prueba para listar usuarios
 * @param request
 * @param response
 */
exports.list = (request, response) => {
    Transaccion.find({}, function (err, transacciones) {
        var transaccionesMap = {};
        transaccioness.forEach(function (transacciones) {
            transaccionesMap[transacciones._id] = transacciones;
        });
        response.send(transaccionesMap);
    });
};

/**
 * Pagar una transacción, verifica si esta esta o no pagada antes de realizar la acción
 * @param request
 * @param response
 * @param next
 * @returns {Promise<void>}
 */
exports.pagarTransaccion = async (request, response, next) => {
    const IdTrx = request.params.id;
    const transaccion = await Transaccion.findOne({IdTrx: IdTrx});
    // validamos si existe
    if (!transaccion)
        response.json({status: 'NOOK', 'error': `La transacción ${IdTrx} no existe`});
    // validamos si la transacción se encuentra pagada
    if (transaccion.Pagada === 'Y')
        response.json({status: 'NOOK', 'error': `La transacción ${IdTrx} ya se encuentra pagada`});
    const updateTransaccion = await Transaccion.updateOne({IdTrx: IdTrx}, {$set: {Pagada: 'Y'}});
    response.json(updateTransaccion.ok == 1 ? {
        status: 'OK',
        Monto: transaccion.Monto,
        IdTrx: IdTrx
    } : {status: 'NOOK'});
};

/**
 * Crea la transacción asociada a un usuario
 * @param request
 * @param response
 * @param next
 */
exports.registrarTransaccion = (request, response, next) => {
    request
        .getValidationResult()
        .then(validationHandler())
        .then((resultado) => {
            if (resultado !== true)
                response.json({status: 'NOOK', 'errors': resultado});
            const {IdTrx, Monto, TipoMoneda, Detalle, Comercio, IdReferidor} = request.body;
            let {FechaTransaccion} = request.body;
            // Validamos si el usuario existe
            const existeUsuario = usuarioExiste(IdReferidor);
            // Si existe, podemos crear la transacciín
            existeUsuario.then((user) => {
                if (!user)
                    response.json({status: 'NOOK', 'error': `El referidor ${IdReferidor} no existe`});
            });
            // Parseamos la fecha
            let timestamp = Date.parse(FechaTransaccion);
            if (isNaN(timestamp) == false) {
                let d = new Date(timestamp);
                FechaTransaccion = d.toISOString().slice(0, 10)
            } else {
                response.json({status: 'NOOK', 'error': 'La fecha ingresada no es válida'});
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
                    if (11000 === error.code || 11001 === error.code) {
                        response.json({status: 'NOOK', 'error': `El id ${IdTrx} para la transacción ya existe`});
                    }
                    response.json({status: 'NOOK', 'errors': error.errors});
                })
        })
        .catch(next, (result) => {
            response.json({status: 'NOOK'});
        })
};