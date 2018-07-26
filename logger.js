var winston = require('winston');
var configuration = require("./config");
const emitter = require('./jfEmitter');
var _logger = undefined;

configuration.load();
configureLogger();

emitter.get().on('configChange', () => {
  _logger.warn("Config file changed. Reconfiguring logger");
  configureLogger();
});

function configureLogger() {
  if (!configuration.get()) {
    configuration.load();
  }
  var config = configuration.get();

  var logOptions = {
    level: config.logger.consoleLogLevel,
    format: winston.format.combine(winston.format.splat(), winston.format.json()),
    transports: [
      new winston.transports.Console()
    ],
    exitOnError: false
  };

  if (config.logger.filename) {
    logOptions.transports.push(new winston.transports.File({ filename: config.logger.filename, level: config.logger.fileLogLevel }));
  }

  if (_logger) {
    _logger.configure(logOptions);
  } else {
    _logger = winston.createLogger(logOptions);
  }
}

exports.log = _logger;
