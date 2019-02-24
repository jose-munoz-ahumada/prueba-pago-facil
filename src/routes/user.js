const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.get('/usuario', userController.list);

router.put('/usuario/activar/:id', userController.activar);

router.get('/usuario/saldo/:id', userController.obtenerSaldo);

router.post(
    '/usuario/registrar',
    userController.validate('registrarUsuario'),
    userController.registrarUsuario,
);

module.exports = router;