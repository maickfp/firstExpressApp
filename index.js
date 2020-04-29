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

// Variables
let users = [];
let tokens = [];

// Middlewares
const logger = (req, res, next) => {
    log.info(`[${req.ip}] ${req.method} ${req.protocol} ${req.path}`);
    next();
};
const secured = (req, res, next) => {
    const token = req.header("token");

    if(tokens.includes(token)){
        next();
    }else{
        log.warn(`Token ${token} inválido`);
        res.status(500).send("Token inválido");
    }
};
const auth = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = users.find(tmpUser => tmpUser.username == username);

    let status = "notExist";
    if(user !== undefined){
        status = user.password == password ? "ok" : "invalidPassword";
    }
    
    switch(status){
        case "ok":
            next();
            break;
        case "invalidPassword":
            res.status(500).send(`Clave inválida`);
            break;
        default:
            res.status(500).send(`No existe el usuario ${username}`);
    }

};

// CONFIGURACIONES GENERALES
// logger propio
app.use(logger);
// deshabilitar cache
app.use(nocache());
// parse application/json
app.use(bodyParser.json());

// FUNCIONES Y PROCEDIMIENTOS GENERALES
function generateToken(){
    const token = Math.floor((Math.random() * 100000)).toString();
    tokens.push(token);
    return token;
}

// Ruta: raiz
app.get('/', (req, res)=>{
    res.sendStatus(500);
});

// Ruta: users
// Login
app.post('/users/login', auth, (req, res) => {
    const username = req.body.username;
    const token = generateToken();
    res.status(200).send(`Bienvenid@ ${username}. Token: ${token}`);
});
// Listar
app.get('/users', secured, (req, res)=>{
    let usersList = "<ul>";
    users.forEach((user)=>{
        usersList += `<li>${user.username}</li>`;
    });
    usersList += "</ul>"
    res.status(200).send(`<h1>USUARIOS</h1>${usersList}`);
});
// Mostrar Detalle
app.get('/users/:username', secured, (req, res)=>{
    const username = req.params.username;

    const user = users.find(tmpUser => tmpUser.username == username);

    if(user === undefined){
        res.status(404).send(`NO EXISTE EL USUARIO ${username}`)
    }else{
        res.status(200).send(`DETALLE DEL USUARIO @${user.username}`);
    }
});
// Crear
app.post('/users', (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    const user = users.find(tmpUser => tmpUser.username == username);
    
    if(user !== undefined){
        res.status(500).send(`YA EXISTE EL USUARIO ${username}`)
    }else{
        users.push({
            username: username,
            password: password
        });
        res.status(201).send(`USUARIO ${username} CREADO`);
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
        res.status(404).send(`<h1>NO EXISTE EL USUARIO CON ID ${id}</h1>`)
    }else{
        user.name= req.body.name;
        res.status(200).send(`<h1>USUARIO CON ID ${id} ACTUALIZADO</h1>`);
    }
});
// Eliminar
app.delete('/users/:id', (req, res)=>{
    const id = req.params.id;
    let userExist = false;
    for(let i in users){
        const user = users[i];
        if(user.id == id){
            users.splice(i,1);
            userExist = true;
            break;
        }
    }
    
    if(!userExist){
        res.status(404).send(`<h1>NO EXISTE EL USUARIO CON ID ${id}</h1>`)
    }else{
        res.status(200).send(`<h1>USUARIO CON ID ${id} ELIMINADO</h1>`);
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