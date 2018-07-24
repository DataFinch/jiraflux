const EventEmitter = require('events');
const _emitter = new EventEmitter();

exports.get = function() {
  return _emitter;
}
