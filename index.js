// MODULOS DE TERCEROS
// importar nocache
const nocache = require('nocache')
// importar express
const express = require('express');
// importar body-parser
const bodyParser = require('body-parser');
// importar fs - manejo de archivos
const fs = require("fs");
// importar jsonwebtoken
const jwt = require('jsonwebtoken');
// importar morgan - logger de tercero
const morgan = require('morgan');
// imporatar rotating-file-stream - rotar archivos (logs)
const rfs = require("rotating-file-stream");

// MODULOS PROPRIOS
// importar configuracion
const config = require("./mine_modules/config");
// importar log
const log = require("./mine_modules/log");
// importar security
const security = require("./mine_modules/security");

// Inicializadores
const app = express();

// Variables
let users = [];
// stream para logger morgan - peticiones
const accessLoggerStream = rfs.createStream("access.log", {
    path: "./logs",
    size: "10M",
    interval: "1d",
    compress: "gzip"
});

// Middlewares propios
const errorLogger = (err, req, res, next) => {
    log.error(`[${req.ip}] ${req.protocol} ${req.method} ${req.path} STACK: ${err.stack}`);
    res.status(500).send(`Ha ocurrido un error interno en el sistema`);
};
const secured = (req, res, next) => {
    const token = req.header("x-auth");
    
    jwt.verify(token, config.tokenKey, (err, user) => {
        if(err){
            // TokenExpiredError
            log.warn(`[${req.ip}] Token ${token} inválido. Error:${err.name}`);
            res.status(500).send(`Token inválido. ${err.name}`);
        }else{
            req.user = user;
            next();
        }
    });
};
const auth = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = users.find(tmpUser => tmpUser.username == username);

    let status = "notExist";
    if(user !== undefined){
        status = security.comparePassword(password, user.password) ? "ok" : "invalidPassword";
    }
    
    switch(status){
        case "ok":
            req.user = user;
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
// logger morgan
app.use(morgan('combined', {stream: accessLoggerStream}));
// logger de errores propio
app.use(errorLogger);
// deshabilitar cache
app.use(nocache());
// parse application/json
app.use(bodyParser.json());

// FUNCIONES Y PROCEDIMIENTOS GENERALES
function generateToken(user){
    const tokenUser = {
        username: user.username
    };

    const token = jwt.sign(tokenUser, config.tokenKey, {
        expiresIn: '1h'
    });

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
    const userIndex = users.findIndex(tmpUser => tmpUser.username == user.username);

    if(userIndex !== -1){
        log.error(`YA EXISTE EL USUARIO @${user.username}`);
        return false;
    }

    // encriptar password
    user.password = security.encodePassword(user.password);

    users.push(user);
    log.info(`USUARIO @${user.username} CREADO`);
    return true;
}

// Ruta: raiz
app.get('/', (req, res)=>{
    res.sendStatus(500);
});

// Ruta: users
// Login
app.post('/users/login', auth, (req, res) => {
    const user = req.user;
    const token = generateToken(user);
    res.status(200).send(`Bienvenid@ ${user.username}. Token: ${token}`);
});
// Logout
app.post('/users/logout', (req, res) => {
    const token = req.header("x-auth");
    // expirar token
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
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    const userCreated = createUser({
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName
    });
    
    if(!userCreated){
        res.status(500).send(`YA EXISTE EL USUARIO @${username}`)
    }else{
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