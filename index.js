// importar nocache
const nocache = require('nocache')
// importar express
const express = require('express');
// importar body-parser
const bodyParser = require('body-parser');
// importas fs - manejo de archivos
const fs = require("fs");

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
        log.warn(`[${req.ip}] Token ${token} inválido`);
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
            res.status(500).send(`No existe el usuario @${username}`);
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
function loadUsers(){
    fs.readFile("./files/usuarios.json", "utf8", (err, data) => {
    
        if(err){
            log.error("HA OCURRIDO UN ERROR LEYENDO ARCHIVO DE USUARIOS");
            return;
        }
    
        const usersTmp = JSON.parse(data);
        usersTmp.forEach((user)=>{
            createUser(user);
        });
        
        
    });
}
function createUser(user){
    users.push(user);
    log.info(`USUARIO @${user.username} CREADO`);
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
// Logout
app.post('/users/logout', secured, (req, res) => {
    const token = req.header("token");
    const tokenIndex = tokens.indexOf(token);
    tokens.splice(tokenIndex,1);
    res.status(200).send(`Adiós vaquero`);
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
        res.status(404).send(`NO EXISTE EL USUARIO @${username}`)
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
        res.status(500).send(`YA EXISTE EL USUARIO @${username}`)
    }else{
        createUser({
            username: username,
            password: password
        })
        res.status(201).send(`USUARIO @${user.username} CREADO`);
    }
});
// Editar
app.put('/users/:username', secured, (req, res)=>{
    const username = req.params.username;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const user = users.find(tmpUser => tmpUser.username == username);
    
    if(user === undefined){
        res.status(404).send(`NO EXISTE EL USUARIO @${username}`)
    }else{
        if(user.password !== oldPassword){
            res.status(500).send(`CLAVE ANTERIOR INCORRECTA`)
        }else{
            user.password = newPassword;
            res.status(200).send(`USUARIO @${username} ACTUALIZADO`);
        }
    }
});
// Eliminar
app.delete('/users/:username', secured, (req, res)=>{
    const username = req.params.username;

    const userIndex = users.findIndex(tmpUser => tmpUser.username == username);
    
    if(userIndex === -1){
        res.status(404).send(`NO EXISTE EL USUARIO @${username}`);
    }else{
        users.splice(userIndex,1);
        res.status(200).send(`USUARIO @${username} ELIMINADO`);
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
    loadUsers();
    log.info(`Servidor iniciado en puerto ${config.port}`);
});