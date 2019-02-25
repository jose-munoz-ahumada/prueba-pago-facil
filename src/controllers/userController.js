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
 * Definición de validación para registro de usuarios
 * @param method
 * @returns {ValidationChain[]}
 */
exports.validate = (method) => {
    switch (method) {
        case 'registrarUsuario': {
            return [
                body('Nombre', 'Es requerido').exists(),
                body('Apellido', 'Es requerido').exists(),
                body('DocumentoIdentidad', 'Es requerido').exists(),
                body('TipoDocumento', 'Es requerido').exists(),
                body('Email', 'Es requerido').exists()
                    .isEmail()
                    .withMessage('El Email ingresado no es válido')
                    .custom(async (value) => {
                        let user = await User.find({Email: value})
                        return user.length == 0;
                    })
                    .withMessage(`El email ya se encuentra registrado`),
                body('Nombre', 'Es requerido').exists(),
                body('Password', 'Es requerido').exists(),
                body('DOB', 'Es requerido').isInt(),
                body('Sexo', 'Es requerido').exists().isIn(['Femienino', 'Masculino', 'Otro'])
                    .withMessage('Los valores válidos para Sexo son Femenino, Masculino u Otro'),
                body('NombreBanco', 'Es requerido').exists(),
                body('NumeroCuenta', 'Es requerido').exists().isInt()
                    .withMessage('El Número de cuenta debe contener solo números'),
                body('TipoCuenta', 'Es requerido').exists().isIn(['Corriente', 'Vista'])
                    .withMessage('Los valores válidos para TipoCuenta son Corriente, Vista')
            ]
        }
    }
};

exports.list = (request, response) => {
    User.find({}, function (err, users) {
        var userMap = {};
        users.forEach(function (user) {
            userMap[user._id] = user;
        });
        response.send(userMap);
    });
};

exports.activar = async (request, response, next) => {
    const objUser = await User.findById(request.params.id, {});
    if (!objUser)
        response.json({status: 'NOOK', 'error': `El usuario ${request.params.id} no existe`});
    if (objUser.Status === 'ACTIVO' || objUser.Comision != 0)
        response.json({status: 'NOOK', 'error': `El usuario ${request.params.id} ya fue activado anteriormente`});
    const {Comision} = request.body;
    // verificamos si es un valor numerico flotante
    var isValid = !/^\s*$/.test(Comision) && !isNaN(Comision);
    if (isValid) {
        // si es valido, verificamos que el valor este entre 0 y 1
        if (parseFloat(Comision) > 1 || parseFloat(Comision) < 0) {
            response.json({status: 'NOOK', 'error': `La comisión no debe contener valores entre 0 y 1`});
        }
        // si es válido, se actualiza el registro
        const updateUser = await User.updateOne({_id: objUser._id}, {$set: {Comision: Comision, Status: 'ACTIVO'}});
        response.json(updateUser.ok == 1 ? {
            status: 'OK',
            IdUsuario: objUser._id,
            Comision: Comision
        } : {status: 'NOOK'})
    } else {
        response.json({status: 'NOOK', 'error': `El valor de comisión ingresado no parece ser válido`});
    }
};

exports.obtenerSaldo = async (request, response, next) => {
    /**
     * Realizado así por tiempo
     */
    const objTransaccion = await Transaccion.find({IdReferidor: request.params.id});
    const objUser = await User.findById(request.params.id, {});
    if (!objUser)
        response.json({status: 'NOOK', 'error': `El usuario ${request.params.id} no existe`});
    if (objUser.Status === 'PENDIENTE' || objUser.Comision == 0)
        response.json({status: 'NOOK', 'error': `El usuario ${request.params.id} se encuentra inactivo`});
    let retorno = {};
    retorno.usuario = objUser._id;
    objTransaccion.forEach((element) => {
        let fecha = new Date(element.FechaTransaccion);

        let key = `${fecha.getUTCMonth()}${fecha.getFullYear()}`;
        let subtotalComision = element.Monto * objUser.Comision;
        let subtotalPagado = 0;
        if (element.Pagada == 'Y') {
            subtotalPagado = subtotalComision;
        }
        if (retorno.hasOwnProperty(key)) {
            retorno[key].ComisionAcumulada += subtotalComision;
            retorno[key].ComisionPagada += subtotalPagado;
            retorno[key].SaldoAPagar += (subtotalComision - subtotalPagado);
        } else {
            retorno[key] = {
                ComisionAcumulada: subtotalComision,
                ComisionPagada: subtotalPagado,
                SaldoAPagar: subtotalComision - subtotalPagado
            }
        }
    });
    response.json(retorno);
};

exports.registrarUsuario = (request, response, next) => {
    request
        .getValidationResult() // validación de express
        .then(validationHandler())
        .then((resultado) => {
            if (resultado !== true)
                response.json({status: 'NOOK', 'errors': resultado});
            const {Nombre, Apellido, DocumentoIdentidad, TipoDocumento, Email, Password, DOB, Sexo, NombreBanco, NumeroCuenta, TipoCuenta} = request.body
            // Creamos Usuario
            User.create({
                Nombre,
                Apellido,
                DocumentoIdentidad,
                TipoDocumento,
                Email,
                Password,
                DOB,
                Sexo,
                NombreBanco,
                NumeroCuenta,
                TipoCuenta
            })
                .then(user => {
                    response.json({status: 'OK', 'Id': user._id})
                })
                .catch(error => {
                    response.json({status: 'NOOK', error})
                })
        })
        .catch(next, (result) => {
            response.json({status: 'NOOK'})
        })
};