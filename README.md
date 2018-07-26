# Overview

JiraFlux is an open-source node application that runs JIRA jql queries and inserts data into InfluxDB. Originally developed at DataFinch Technologies, we use it for gathering key metrics from JIRA and displaying those metrics on Grafana dashboards.

![DataFinch Logo](http://www.datafinch.com/Content/img/logo.png)

## Author

Kevin Carlson
kcarlson@datafinch.com

## Features

The app is driven by a configuration file (jiraflux-config.json) that contains various pieces of infomration required to:

* Connect to a JIRA instance
* Connect to InfluxDB instance
* Define an InfluxDB schema
* Run jql queries on various user-defined intervals
* Write measurements to InfluxDB with given tags and fields

The application also watches for changes in the configuration file that affect the [metrics](#metrics) section and will automatically adjust queries, timing and InfluxDB writes. If configuration changes need to be made to the JIRA or InfluxDB connections, the application needs to be restarted manually (at least it does now).

## Install

git clone https://github.com/DataFinch/jiraflux.git
`npm install`
Create a [configuration file](#configuration)

## Starting the app

`npm start`

## Configuration

The configuration files drives everything.  A sample file `jiraflux-config-sample.json` is included. Alter this to contain the correct connection parameters, remove `-sample` from the name and start the app. If you JIRA and InfluxDB instances are accessible, queries will begin to be made according to timing parameters.

Each section of the configuration file is explained below.

### jira

This section contains the infomation necessary to connect to a JIRA instance.

```js
  "jira": {
    "username": "user",  // user name with read access to the projects you want to query
    "password": "password",
    "protocol": "http",  // or https
    "host": "host.for.jira",  // host name where JIRA lives
    "apiVersion": 2,  
    "strictSSL": false  // or true
  }
```

### influx

Contiains info necessary for connecting to InfluxDB. Currently JiraFlux supports only one Influx database. This may be changed in the future.

```js

  "influxdb": {
    "username": "admin",  // user name with write access to the InfluxDB database listed in this config
    "password": "admin",  
    "database": "jira",  // the database in which to store all JIRA measurements
    "protocol": "https", // or http
    "port": "8086",
    "host": "host.for.influx"  // host name where Influx lives
  }
```

### logger

Defines the settings for logging to a file and to the console. If changes to the configuration file are made, the logger is reconfigured on the fly.

```js
  "logger": {
    "consoleLogLevel": "info", // see below for log levels
    "fileLogLevel": "debug", // see below for log levels
    "filename": ""  // if left undefined or empty, no log file will be used
  },
```

Logger uses [Winston](https://www.npmjs.com/package/winston), which defines the following log levels.

{   error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5
}

For more info on log levels, see [Winston](https://www.npmjs.com/package/winston) documentation.

### schema

Describes the schema for the InfluxDB database. More info on InfluxDB schemas is available on the InfluxDB site.

```js

schema: [{
      "measurement": "Bugs",  // measurement name in the InfluxDB database
      "fields": {
        "total": "Influx.FieldType.INTEGER"  // the data type for the measurement as a string
      },
      "tags": [
        "status",
        "project",
        "source"
      ]
    },
    {
      "measurement": "In Development",
      "fields": {
        "total": "Influx.FieldType.INTEGER"
      },
      "tags": [
        "stage",
        "project",
        "source"
      ]
    },
    ... // other entries
]

```

Note: The InfluxDB documentation for schemas show the types as unquoted (`Influx.FieldType.INTEGER` vs `"Influx.FieldType.INTEGER"`). They are quoted in the the config file so that the JSON will properly parse. After parsing, the application will convert the strings to their enum counterparts.

### metrics

```js
metrics: [{
      "jql": "project = projectname AND issuetype = Bug AND status in (Open, \"In QA\")",
      "desc": "Project: In Progress Bugs",
      "minutes": 30, // how often to run this query
      "measurement": "Bugs",  // what measurement to insert
      "fields": ["total"],  // which field(s)
      "tags": {  // which tags to write to InfluxDB
        "project": "Project",
        "status": "In Progress"
      }
    }, ... // additional metrics entries
]

```

IMPORTANT: Any multi-word project names, status, or other arguments in the jql parameter must be contained in escaped quotation marks `\"` as in above example.