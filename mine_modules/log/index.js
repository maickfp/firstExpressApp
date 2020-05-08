// imporatar rotating-file-stream - rotar archivos (logs)
const rfs = require("rotating-file-stream");

// stream para logger propio - aplicacion
const applicationLoggerStream = rfs.createStream("application.log", {
    path: "./logs",
    size: "10M",
    interval: "1d",
    compress: "gzip"
});

const log = {
    info: (msg) => {
        printLine(`INFO [${new Date()}]: ${msg}`);
    },
    warn: (msg) => {
        printLine(`WARN [${new Date()}]: ${msg}`);
    },
    error: (msg) => {
        printLine(`**ERROR** [${new Date()}]: ${msg}`);
    }
};

function printLine(line){
    applicationLoggerStream.write(`${line}\n`);
}

module.exports = log;