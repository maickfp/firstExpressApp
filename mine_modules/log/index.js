// importar fs - manejo de archivos
const fs = require("fs");
// importar path
const path = require("path");

const log = {
    info: (msg) => {
        printLine(`INFO [${new Date()}]: ${msg}\n`);
    },
    warn: (msg) => {
        printLine(`WARN [${new Date()}]: ${msg}\n`);
    },
    error: (msg) => {
        printLine(`**ERROR** [${new Date()}]: ${msg}\n`);
    }
};

function printLine(line){
    fs.appendFile("./logs/application.log", line, (err)=>{
        if(err){
            console.log(`Log error. ${line}`);
        }
    });
}

module.exports = log;