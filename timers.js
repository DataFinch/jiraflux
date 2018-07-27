const logger = require('./logger').log;
var _timerList = [];

exports.createIntervalTimers = createIntervalTimers;
exports.clearIntervalTimers = clearIntervalTimers;

function createIntervalTimers(config, callback) {
  var timerID;
  config.metrics.forEach(function(metric) {
    logger.verbose("Creating task: %s - %d minutes", metric.desc, metric.minutes);
    var millis = metric.minutes * 60 * 1000;
    timerID = setInterval(callback, millis, metric);
    _timerList.push(timerID);
  });
}

function clearIntervalTimers() {
  logger.verbose("Clearing tasks");
  _timerList.forEach((timerID) => {
    clearInterval(timerID);
  });
  _timerList = [];
}
