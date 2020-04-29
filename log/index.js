const log = {
    info: (msg) => {
        console.log(`INFO: ${msg}`);
    },
    warn: (msg) => {
        console.log(`WARN: ${msg}`);
    },
    error: (msg) => {
        console.log(`**ERROR**: ${msg}`);
    }
};

module.exports = log;