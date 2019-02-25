# Prueba Backend Pago Fácil

El siguiente proyecto es una API de prueba para Pago Fácil, la cual esta realizada en **NodeJS** con **framework Express** y **MongoDB** como motor de base de datos.


# Requerimientos de la aplicación

* NodeJS >= 8.11.4
* NPM >= 6.4.0
* MongoDB 4.0.6

## Instalacion

```console
foo@bar:~$ git clone https://github.com/jose-munoz-ahumada/prueba-pago-facil.git <ruta-archivo>
foo@bar:~$ cd <ruta-archivo>
foo@bar:~$ npm install
```
* Para Cambiar la configuración por defecto de la conexión a la base de datos y cambiar el puerto de la aplicación,  copiar archivo .env.default y crear un archivo  .env
```console
# Configuración de Aplicacion  
  
PORT=  
NODE_ENV=  
  
# Configuración de Base de Datos  
  
DB_DRIVER=  
DB_PORT=  
DB_HOST=  
DB_NAME=  
DB_USER=  
DB_PASS=
```

Para inicializar la aplicación
```console
foo@bar:~$ npm start
```
O bien en modo desarrollo
```console
foo@bar:~$ npm run dev
```
Los métodos de la API, son los mismo que están definidos en el archivo de la prueba.

# Métodos

* POST /usuario/registrar
* GET /usuario/saldo/{id}
* PUT /usuario/activar/{id}
* POST /transaccion/registrar
* PUT /transaccion/pagar/{idTrx}