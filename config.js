var fs = require("fs");
const Influx = require('influx');
const emitter = require('./jfEmitter');

var _configInfo = {};
const _configFileName = "./jiraflux-config.json"

const typeMap = {
  "Influx.FieldType.INTEGER": Influx.FieldType.INTEGER,
  "Influx.FieldType.FLOAT": Influx.FieldType.FLOAT,
  "Influx.FieldType.STRING": Influx.FieldType.STRING,
  "Influx.FieldType.BOOLEAN": Influx.FieldType.BOOLEAN
}

exports.load = function() {
  _configInfo = {};

  try {
    var configText = fs.readFileSync(_configFileName);
    _configInfo = JSON.parse(configText);
  } catch (e) {
    logger.error(e);
  }

  _configInfo.schema = retypeSchema(_configInfo.schema);
  return _configInfo;
}

exports.get = function() {
  return _configInfo;
}

function retypeSchema(s) {
  var newSchema = s;

  for (var index in newSchema) {
    var fields = newSchema[index].fields;
    for (var key in fields) {
      fields[key] = typeMap[fields[key]]; // safer than eval
    }
  }
  return newSchema;
}


fs.watchFile(_configFileName, (curr, prev) => {
  logger.warn("Configuration file changed.");
  exports.load();
  emitter.get().emit('configChange');
});

// has to remain at the bottom of the file to resolve load conflicts
// since logger and config are interdependent
const logger = require('./logger.js').log;
