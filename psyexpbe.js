#!/usr/local/bin/node

// Imports and constants
// =====================

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

// Main
// ====

if (argv._[0] == 'help') {
  info(`
psyexpbe.js is the simples possbible (or at least very close) backend for storing
            data for psychological (or any) experiments. It does authenticates
            request for storing data using a UUID (which then should be kept)
            secret.

node psyexpbe.js <command>
  help                                                  show this help
  config                                                show the current configuration
  init                                                  WARNING: creates a empty file with experiments, perform at initial setup only!
  add --name="experiment name" --email=name@example.com add new experiment
  list                                                  list the experiments
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
} else if (argv._[0] == 'add' || argv._[0] == 'list' ) {
  debug('Fetching', process.env.CONFIG, 'from the bucket', process.env.BUCKET )
  helpers.getS3(process.env.BUCKET, process.env.CONFIG)
  .then((data) => {
    //debug(data);
    if (argv._[0] == 'add') {
      if (argv._.length != 1) {
        error('add takes two arguments, see help');
      } else {
        const UUID = helpers.uuid();
        log('Added expriment "', argv.name, '" with unique id', UUID, 'for user', argv.email);
      }
    }
    return;
  })
} else {
  error('unknown command: use `./psyexpbe.js help` or `node psyexpbe.js help` to show the help');
}
