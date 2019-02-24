const express = require('express');
const router = express.Router();

const User = require('../model/user');

router.get('/', (request, response) => {
    response.send({'Status' : 'OK', 'Mensaje' : 'Api Pago Fácil'})
});

module.exports = router;