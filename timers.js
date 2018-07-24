var configuration = require("./config");
var _timerList = [];

exports.createIntervalTimers = createIntervalTimers;
exports.clearIntervalTimers = clearIntervalTimers;

function createIntervalTimers(callback) {
  var timerID;
  configuration.get().metrics.forEach(function(metric) {
    var millis = metric.minutes * 60 * 1000;
    timerID = setInterval(callback, millis, metric);
    _timerList.push(timerID);
  });
}

function clearIntervalTimers() {
  _timerList.forEach((timerID) => {
    clearInterval(timerID);
  });
  _timerList = [];
}
