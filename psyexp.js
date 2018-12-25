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


// api
// ====

const checkExp = function(config, exp) {
  return config.experiments.includes(exp);
};

const start = function(config) {
  this.config = config;
  http.createServer((req, res) => {
    const experiment = req.url.split('/')[1];
    const trial = req.url.split('/')[2];
    debug(req.method, req.url);
    if (experiment == 'status') {
      res.write('Alive and well!');
    } if (req.method == 'POST' && checkExp(this.config, experiment)) {
      res.write('POSTing to ' + experiment + ' and trial ' + trial);
    } if (req.method == 'GET' && checkExp(this.config, experiment)) {
      res.write('GETing ' + experiment + ' and trial ' + trial);
    } else {
      res.write('Unknown experiment ' + experiment + 'or method ' + req.method);
    }
    res.end();
  }).listen(process.env.PORT, function(){
   console.log("server start at port", process.env.PORT);
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
  `);
} else if (argv._[0] == 'config') {
  info('Config file:', process.env.CONFIG, 'in bucket:', process.env.BUCKET );
} else if (argv._[0] == 'init') {
  log('Save empty', process.env.CONFIG, 'to the bucket', process.env.BUCKET );
  helpers.saveS3(process.env.BUCKET,
    { filename: process.env.CONFIG,
      data: JSON.stringify({ experiments : [] })
    }
  ).then(log);
} else if (argv._[0] == 'add' || argv._[0] == 'list' || argv._[0] == 'start') {
  debug('Fetching', process.env.CONFIG, 'from the bucket', process.env.BUCKET )
  helpers.getS3(process.env.BUCKET, process.env.CONFIG)
  .then((config) => {
    config = JSON.parse(config);
    if (argv._[0] == 'list') {
      info(config);
    }
    if (argv._[0] == 'add') {
      if (argv._.length != 1) {
        error('add takes two arguments, see help');
      } else {
        const UUID = helpers.uuid();
        config.experiments.push(UUID);
        helpers.saveS3(process.env.BUCKET,
          { filename: process.env.CONFIG,
            data: JSON.stringify(config)
          }
        ).then(log);

        log('Added expriment "', argv.name, '" with unique id', UUID, 'for user', argv.email);
      }
    }
    if (argv._[0] == 'start') {
      start(config);
    }
  })
} else {
  error('unknown command: use `./psyexp.js help` or `node psyexp.js help` to show the help');
}
