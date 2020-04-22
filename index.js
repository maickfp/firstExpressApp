// importar nocache
const nocache = require('nocache')
// importar express
const express = require('express');
const app = express();
// importar configuracion
const config = require("./config");

// deshabilitar cache
app.use(nocache());

// Ruta: raiz
app.get('/', (req, res)=>{
    res.status(500).send('Acceso no permitido');
});
app.post('/', (req, res)=>{
    res.status(200).send('Hola mundo! con POST');
});

// Ruta: users
app.get('/users', (req, res)=>{
    res.status(200).send('<h1>USUARIOS</h1>');
});
app.get('/users/:id', (req, res)=>{
    const id = req.params.id;

    id == 1 ?
        res.status(200).send(`<h1>DETALLE USUARIO ${id}</h1>`)
    :
        res.status(500).send(`<h1>USUARIO ${id} INVÁLIDO</h1>`);

});

// Ruta: articles
app.get('/articles', (req, res)=>{
    res.status(200).send('<h1>ARTICULOS</h1>');
});

// Ruta: admin
app.get('/admin', (req, res)=>{
    res.status(200).send('<h1>ADMIN DASHBOARD</h1>');
});

// Iniciar servidor
app.listen(config.port, ()=>{
    console.log(`Servidor iniciado en puerto ${config.port}`);
});