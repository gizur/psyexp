#!/usr/local/bin/node

// Imports and constants
// =====================

var http = require('http');
const argv = require('minimist')(process.argv.slice(2));
const helpers = require('./helpers.js')

// Each installation should create a config file with a uniqeu UUID that is kept secret
// Generate one here: https://www.guidgenerator.com/ (or somewhere else if you prefer)
// { experiments : ['UUID1', 'UUID2'] };


// Logging
// =========

const info  = console.log.bind(console, 'INFO:');
const log   = console.log.bind(console, 'LOG:');
const error = console.log.bind(console, 'ERROR:');
const debug = console.log.bind(console, 'DEBUG:');


// Helpers
// =======

const addExperiment = function(config, name, email) {
  const uuid = helpers.uuid();
  config.experiments.push({uuid: uuid, name: name, email: email});
  helpers.saveS3(process.env.BUCKET,
    { filename: process.env.CONFIG,
      data: JSON.stringify(config)
    }
  ).then(log);

  log('Added expriment "', name, '" with unique id', uuid, 'for user', email);
};


// api
// ====

const Server = function(config) {
  this.config = config;
};

Server.prototype.checkExp = function(exp) {
  var exists = false;
  for (var i=0; i<this.config.experiments.length && !exists; i++) {
    exists = this.config.experiments[i].uuid == exp;
  }
  return exists;
};

Server.prototype.start = function() {
  http.createServer((req, res) => {
    const experiment = req.url.split('/')[1];
    const trial = req.url.split('/')[2];
    if (experiment == 'status') {
      res.end('Alive and well!');
    }
    // Save expriment data or create a new experiment
    else if (req.method == 'POST') {
      var body = '';
      req.on('data', (data) => {
        body += data;
      });
      req.on('end', () => {
        if (!this.checkExp(experiment)) {
          res.end('Unknown experiment: ' + experiment);
        } else {
          helpers.saveS3(process.env.BUCKET,
            { filename: experiment + '/' + trial,
              data: body
            }
          ).then(log);
          res.end('Added ' + body.length + ' characters of data to trail ' +
                    trial + ' in experiment ' + experiment);
        }
      });
    }
    else if (req.method == 'GET' && this.checkExp(experiment)) {
      helpers.listS3(process.env.BUCKET, experiment)
      .then((trials) => {
        // remove the experiment id
        trials = trials.map(e => e.split('/')[1])
        res.end(JSON.stringify(trials));
      });
    }
    else {
      res.end('Unknown experiment: ' + experiment + ' or method: ' + req.method);
    }
  }).listen(process.env.PORT, () => {
    log("Server starts at port", process.env.PORT);
 });
};


// Main
// ====

if (argv._[0] == 'help') {
  info(`
psyexp.js is the simples possbible (or at least very close) backend for storing
            data for psychological (or any) experiments. It does authenticates
            request for storing data using a UUID (which then should be kept)
            secret.

node psyexp.js <command>
  help                                                  show this help
  config                                                show the current configuration
  init                                                  WARNING: creates a empty file with experiments, perform at initial setup only!
  add --name="experiment name" --email=name@example.com add new experiment
  list                                                  list the experiments
  start                                                 start the server
  uuid                                                  get a univeral uniqeu id (for config file etc.)
  `);
}
else if (argv._[0] == 'config') {
  info('Config file:', process.env.CONFIG, 'in bucket:', process.env.BUCKET );
}
else if (argv._[0] == 'uuid') {
  log('UUID:', helpers.uuid());
}
else if (argv._[0] == 'init') {
  log('Save empty', process.env.CONFIG, 'to the bucket', process.env.BUCKET );
  helpers.saveS3(process.env.BUCKET,
    { filename: process.env.CONFIG,
      data: JSON.stringify({ experiments : [] })
    }
  ).then(log);
}
else if (argv._[0] == 'add' || argv._[0] == 'list' || argv._[0] == 'start') {
  log('Fetching config in', process.env.CONFIG, 'from the bucket', process.env.BUCKET )
  helpers.getS3(process.env.BUCKET, process.env.CONFIG)
  .then((config) => {
    config = JSON.parse(config);
    if (argv._[0] == 'list') {
      info(JSON.stringify(config));
    }
    if (argv._[0] == 'add') {
      if (argv._.length != 1 || typeof argv.name === 'undefined' ||
          typeof argv.email === 'undefined') {
        error('add takes two arguments, see help');
      } else {
        addExperiment(config, argv.name, argv.email);
      }
    }
    if (argv._[0] == 'start') {
      const server = new Server(config);
      server.start();
    }
  })
} else {
  error('unknown command: use `./psyexp.js help` or `node psyexp.js help` to show the help');
}
