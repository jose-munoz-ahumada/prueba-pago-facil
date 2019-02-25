const express = require('express');
const router = express.Router();

/**
 * Controller de usuario, nos permite validar las solicitudes que se realizan
 */
const userController = require('../controllers/userController');

router.get('/usuario', userController.list);
router.get('/usuario/saldo/:id', userController.obtenerSaldo);

router.put('/usuario/activar/:id', userController.activar);

router.post(
    '/usuario/registrar',
    userController.validate('registrarUsuario'),
    userController.registrarUsuario,
);

module.exports = router;