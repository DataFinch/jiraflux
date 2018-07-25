var _timerList = [];

exports.createIntervalTimers = createIntervalTimers;
exports.clearIntervalTimers = clearIntervalTimers;

function createIntervalTimers(config, callback) {
  var timerID;
  config.metrics.forEach(function(metric) {
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
