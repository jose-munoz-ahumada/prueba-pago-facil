const {body} = require('express-validator/check');
const Transaccion = require('../model/transaccion');
const User = require('../model/user');

const validationHandler = next => result => {
    if (result.isEmpty()) return true;
    let jsonResponse = [];
    result.array().map(i => jsonResponse.push(`El ${i.param} ${i.msg}`));
    return !next ? jsonResponse : next(jsonResponse);
};

exports.validate = (method) => {
    switch (method) {
        case 'registrarUsuario': {
            return [
                body('userName', 'error').exists(),
                body('email', 'Invalid email').exists().isEmail(),
                body('phone').optional().isInt(),
                body('status').optional().isIn(['enabled', 'disabled'])
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
    const updateUser = await User.updateOne({_id: objUser._id}, {$set: {Comision: Comision, Status: 'ACTIVO'}});
    response.json(updateUser.ok == 1 ? {status: 'OK', IdUsuario: objUser._id} : {status: 'NOOK'})
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
        .getValidationResult() // to get the result of above validate fn
        .then(validationHandler())
        .then(() => {
            const {Nombre, Apellido, DocumentoIdentidad, TipoDocumento, Email, Password, DOB, Sexo, NombreBanco, NumeroCuenta, TipoCuenta} = request.body
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