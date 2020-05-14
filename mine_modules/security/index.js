// importar bcrypt
const bcrypt = require("bcrypt");
// importar jsonwebtoken
const jwt = require('jsonwebtoken');

// MODULOS PROPRIOS
// importar configuracion
const config = require('../config');

const security = {
    encodePassword: (plainPassword) => {
        const salt = bcrypt.genSaltSync(config.saltRounds);
        return bcrypt.hashSync(plainPassword, salt);
    },
    comparePassword: (plainPassword, encryptedPassword) => {
        return bcrypt.compareSync(plainPassword, encryptedPassword);
    },
    generateToken: (user) => {
        const tokenUser = {
            username: user.username
        };
    
        const token = jwt.sign(tokenUser, config.tokenKey, {
            expiresIn: config.tokenExpiresIn
        });
    
        return token;
    },
    verifyToken: (token, req, res, next) => { 
        return jwt.verify(token, config.tokenKey, (err, user) => {
            if(err){
                // TokenExpiredError
                //log.warn(`[${req.ip}] Token ${token} inválido. Error:${err.name}`);
                res.status(500).send(`Token inválido. ${err.name}`);
            }else{
                req.user = user;
                next();
            }
        });
    }
};

module.exports = security;