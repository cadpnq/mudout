const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(info => {
      return `${info.timestamp} ${info.level}: ${info.message}`;
    })
  )
});

if (global.config.enableLogging) {
  logger.add(new winston.transports.Console());
  logger.add(new winston.transports.File({
    filename: `${global.config.logPath}/log.log`,
    tailable: true
  }));
} else {
  logger.add(new winston.transports.Console({level: ' '}));
}

module.exports = logger;
