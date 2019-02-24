const express = require('express');
const router = express.Router();

const transaccionController = require('../controllers/transaccionController');

router.post(
    '/transaccion/registrar',
    transaccionController.validate('registrarTransaccion'),
    transaccionController.registrarTransaccion,
);

router.put(
    '/transaccion/pagar/:id',
    transaccionController.validate('pagarTransaccion'),
    transaccionController.pagarTransaccion,
);

module.exports = router;