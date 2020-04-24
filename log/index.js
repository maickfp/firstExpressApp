const log = {
    info: (msg) => {
        console.log(`INFO: ${msg}`);
    },
    error: (msg) => {
        console.log(`**ERROR**: ${msg}`);
    }
};

module.exports = log;