// importar nocache
const nocache = require('nocache')
// importar express
const express = require('express');
// importar body-parser
const bodyParser = require('body-parser');

// importar configuracion
const config = require("./config");
// importar log
const log = require("./log");

// Inicializadores
const app = express();
let users = [];

// CONFIGURACIONES GENERALES
// deshabilitar cache
app.use(nocache());
// parse application/json
app.use(bodyParser.json());

// Ruta: raiz
app.get('/', (req, res)=>{
    res.sendStatus(500);
});

// Ruta: users
// Listar
app.get('/users', (req, res)=>{
    let usersList = "<ul>";
    for(i in users){
        const tmpUser = users[i];
        usersList += `<li>${tmpUser.id} - ${tmpUser.name}</li>`;
    }
    usersList += "</ul>"
    res.status(200).send(`<h1>USUARIOS</h1>${usersList}`);
});
// Mostrar Detalle
app.get('/users/:id', (req, res)=>{
    const id = req.params.id;
    let user = null;
    for(i in users){
        const tmpUser = users[i];
        if(tmpUser.id == id){
            user = tmpUser;
            break;
        }
    }

    if(user == null){
        res.status(404).send(`<h1>NO EXISTE EL USUARIO ${id}</h1>`)
    }else{
        res.status(200).send(`<h1>USUARIO ${id}</h1><p>name:${user.name}</p>`);
    }
});
// Crear
app.post('/users', (req, res)=>{
    const user = {
        id: req.body.id,
        name: req.body.name
    };

    let userExist = false;
    for(i in users){
        const tmpUser = users[i];
        if(tmpUser.id == user.id){
            userExist = true;
            break;
        }
    }
    
    if(userExist){
        res.status(500).send(`<h1>YA EXISTE EL USUARIO ${user.id}</h1>`)
    }else{
        users.push(user);
        res.status(201).send(`<h1>USUARIO ${user.name} CON ID ${user.id} CREADO</h1>`);
    }
});
// Editar
app.put('/users/:id', (req, res)=>{
    const id = req.params.id;
    let user = null;
    for(let i in users){
        const tmpUser = users[i];
        if(tmpUser.id == id){
            user = tmpUser;
            break;
        }
    }
    
    if(user == null){
        res.status(404).send(`<h1>NO EXISTE EL USUARIO ${id}</h1>`)
    }else{
        user.name= req.body.name;
        res.status(200).send(`<h1>USUARIO ${id} ACTUALIZADO</h1>`);
    }
});
// Eliminar
app.delete('/users/:id', (req, res)=>{
    const id = req.params.id;
    let userExist = false;
    for(let i in users){
        const user = users[i];
        if(user.id == id){
            userExist = true;
            break;
        }
    }
    
    if(!userExist){
        res.status(404).send(`<h1>NO EXISTE EL USUARIO ${id}</h1>`)
    }else{
        users.splice(i,i+1);
        res.status(200).send(`<h1>USUARIO ${id} ELIMINADO</h1>`);
    }
});

// Ruta: articles
app.get('/articles', (req, res)=>{
    const usuario = req.query.usr;
    res.status(200).send(`<h1>ARTICULOS</h1><p>usuario:${usuario}</p>`);
});

// Ruta: admin
app.get('/admin', (req, res)=>{
    res.status(200).send('<h1>ADMIN DASHBOARD</h1>');
});

// Iniciar servidor
app.listen(config.port, ()=>{
    log.info(`Servidor iniciado en puerto ${config.port}`);
});