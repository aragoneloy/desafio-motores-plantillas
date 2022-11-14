import winston from "winston";
import config  from './config.js';

function buildDefaulLogger() {
    const defaultLogger = winston.createLogger({
        transports: [
            new winston.transports.Console({level: 'info'}),
            new winston.transports.File({ filename: 'warn.log', level: 'warn'}),
            new winston.transports.File({ filename: 'error.log', level: 'error'}),
        ]
    })

    return defaultLogger;
}

function buildProductionLogger() {
    const productionLogger = winston.createLogger({
        transports: [
            new winston.transports.File({ filename: 'error.log', level: 'warn'}),
        ]
    })

    return productionLogger;
}

let logger = null;

console.log(config.env)

if (config.env == 'production') {
    logger = buildProductionLogger();
} else {
    logger = buildDefaulLogger();
}

export {logger};


