// path
const path = require('path');
// express
const express = require('express');
const expressValidator = require('express-validator');
const app = express();

const bodyParser = require('body-parser');
const morgan = require('morgan');

// Base de datos
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pago-facil', {useNewUrlParser: true, useCreateIndex: true})
    .then(db => console.log('Db connected'))
    .catch(err => console.log(err));

// variables express
app.set('puerto', process.env.PORT || 3000);

// middlewares
app.use(morgan('dev'));

app.use(bodyParser.json()); // Permite recibir parametros JSON
app.use(bodyParser.urlencoded({     // Permite recibir URL-encoded body
    extended: true
}));
app.use(expressValidator());


// rutas
const rutaIndex = require('./routes/index');
const user = require('./routes/user');
const transaccion = require('./routes/transaccion');
app.use('/', rutaIndex);
app.use('/', user);
app.use('/', transaccion);

// inicializar servidor
app.listen(app.get('puerto'), () => {
    console.log(`Servidor inicializado en puerto ${app.get('puerto')}`)
});