// importar bcrypt
const bcrypt = require("bcrypt");

// variables
const saltRounds = 5;

const security = {
    encodePassword: (plainPassword) => {
        const salt = bcrypt.genSaltSync(saltRounds);
        return bcrypt.hashSync(plainPassword, salt);
    },
    comparePassword: (plainPassword, encryptedPassword) => {
        return bcrypt.compareSync(plainPassword, encryptedPassword);
    }
};

module.exports = security;