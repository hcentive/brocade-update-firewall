var winston = require('winston');
var fs = require('fs');

var logDir = './log';
var logFile = 'brocade-update-banned-ips.log';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({handleExceptions: true, level: 'debug'}),
    new (winston.transports.File)({
      filename: logDir + '/' + logFile,
      handleExceptions: true,
      humanReadableUnhandledException: true,
      level: 'info'
    })
  ]
});

module.exports = logger;
