// Config
require('dotenv').config();
// path
const path = require('path');
// express
const express = require('express');
const expressValidator = require('express-validator');
const app = express();

const bodyParser = require('body-parser');
const morgan = require('morgan');

// Base de datos, si no estan definidas las variables en el archivo .env, se definen por defecto con los siguientes valores
app.set('DB_DRIVER', process.env.DB_DRIVER || 'mongodb');
app.set('DB_HOST', process.env.DB_HOST || 'localhost');
app.set('DB_PORT', process.env.DB_PORT || 27017);
app.set('DB_NAME', process.env.DB_NAME || 'pago-facil');
const mongoose = require('mongoose');
// Creamos URL de Conexión a Base de datos
let urlDb = [
    `${app.get('DB_DRIVER')}://`,
];
if (process.env.DB_USER)
    urlDb.push(process.env.DB_USER);
if (process.env.DB_PASS && process.env.DB_USER)
    urlDb.push(`:${process.env.DB_PASS}@`);
urlDb.push(`${app.get('DB_HOST')}:${app.get('DB_PORT')}/${app.get('DB_NAME')}`);

const databaseSettings = urlDb.join('');

mongoose.connect(databaseSettings, {useNewUrlParser: true, useCreateIndex: true})
    .then(() => process.env.NODE_ENV !== 'production' ? console.log('DB Connected') : '')
    .catch(err => console.log(err));

// variables express
app.set('PORT', process.env.PORT || 3000);

// middlewares
app.use(morgan('dev'));

app.use(bodyParser.json()); // Permite recibir parametros JSON
app.use(bodyParser.urlencoded({ // Permite recibir URL-encoded body
    extended: true
}));
// Habilitar validaciones de express
app.use(expressValidator());


// rutas
const rutaIndex = require('./routes/index');
const user = require('./routes/user');
const transaccion = require('./routes/transaccion');
app.use('/', rutaIndex);
app.use('/', user);
app.use('/', transaccion);

// inicializar servidor
app.listen(app.get('PORT'), () => {
    console.log(`Servidor inicializado en puerto ${app.get('PORT')}`)
});