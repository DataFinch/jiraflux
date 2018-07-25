var JiraApi = require('jira-client');
const Influx = require('influx');
var configuration = require("./config");
const timers = require('./timers');
const emitter = require('./jfEmitter');

var config = configuration.load();

const jira = new JiraApi({
  protocol: config.jira.protocol,
  host: config.jira.host,
  username: config.jira.username,
  password: config.jira.password,
  apiVersion: config.jira.apiVersion,
  strictSSL: config.jira.strictSSL
});

const influx = new Influx.InfluxDB({
  host: config.influxdb.host,
  database: config.influxdb.database,
  username: config.influxdb.username,
  password: config.influxdb.password,
  schema: config.schema
});

timers.createIntervalTimers(config, getMetrics);

emitter.get().on('configChange', () => {
  timers.clearIntervalTimers();
  timers.createIntervalTimers(configuration.get(), getMetrics);
});

function getMetrics(metric) {
  jira.searchJira(metric.jql)
    .then((data) => {
      var mapData = destructure(data, metric.fields);

      influx.writePoints([{
          measurement: metric.measurement,
          tags: metric.tags,
          fields: mapData
        }], { database: config.influxdb.database })
        .then(result => {
          console.log("Written: " + metric.desc);
        })
        .catch(err => {
          console.error("Error saving data to InfluxDB!", err);
        });
    })
    .catch((error) => {
      console.error(error);
    });

}

function destructure(object, attributes) {
  var newObj = {};
  attributes.forEach(function(attribute) {
    newObj[attribute] = object[attribute];
  });
  return newObj;
}
