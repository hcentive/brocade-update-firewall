var winston = require('winston');
var fs = require('fs');
var path = require('path');

var log = JSON.parse(fs.readFileSync(path.join('.', 'conf', 'default.json')));

if (!fs.existsSync(log.logdir)) {
  fs.mkdirSync(log.logir);
}

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({handleExceptions: true, level: 'debug'}),
    new (winston.transports.File)({
      name: 'info-log',
      filename: log.logdir + '/' + log.infolog,
      handleExceptions: true,
      humanReadableUnhandledException: true,
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-log',
      filename: log.logdir + '/' + log.errorlog,
      level: 'error'
    })
  ]
});

module.exports = logger;
