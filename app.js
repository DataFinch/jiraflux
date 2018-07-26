const JiraApi = require('jira-client');
const Influx = require('influx');
var configuration = require('./config');
const timers = require('./timers');
const emitter = require('./jfEmitter');
const logger = require('./logger').log;

var config = configuration.load();

logger.info("JiraFlux starting...");

const jira = new JiraApi({
  protocol: config.jira.protocol,
  host: config.jira.host,
  username: config.jira.username,
  password: config.jira.password,
  apiVersion: config.jira.apiVersion,
  strictSSL: config.jira.strictSSL
});

logger.info("Connected to Jira @ %s", config.jira.host);

const influx = new Influx.InfluxDB({
  host: config.influxdb.host,
  port: config.influxdb.port,
  protocol: config.influxdb.protocol,
  database: config.influxdb.database,
  username: config.influxdb.username,
  password: config.influxdb.password,
  schema: config.schema
});

logger.info("Connected to Influx @ %s", config.influxdb.host);

timers.createIntervalTimers(config, getMetrics);

logger.info("Jiraflux started.")

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
          logger.info("Written: " + metric.desc);
        })
        .catch(err => {
          logger.error("Error saving data to InfluxDB!", err);
        });
    })
    .catch((error) => {
      logger.error(error);
    });

}

function destructure(object, attributes) {
  var newObj = {};
  attributes.forEach(function(attribute) {
    newObj[attribute] = object[attribute];
  });
  return newObj;
}
