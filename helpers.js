
// helpers.js

// imports
// =======

const AWS = require('aws-sdk');

const CONFIG = require('./config.js');

// Setup logging
// =============

const log = console.log.bind(console);
const debug = console.log.bind(console, 'DEBUG');
const info = console.info.bind(console);
const error = console.error.bind(console);


// Functions
// =========

var H = {};


// AWS S3 functions
// ----------------

H.saveS3 = function(params) {
  return new Promise((fulfill, reject) => {
    var s3 = new AWS.S3();
    //debug({Bucket: CONFIG.EXPORT_BUCKET, Key: params.ticker, Body: params.data}, params);
    s3.putObject({Bucket: CONFIG.EXPORT_BUCKET, Key: params.ticker, Body: params.data}, (err, data) => {
      if (err) reject(err);
      else {
        fulfill('Successfully uploaded ' + params.ticker + ' data');
      }
    });
  });
};

H.getS3 = function(ticker) {
  return new Promise((fulfill, reject) => {
    var s3 = new AWS.S3();
    var buf = Buffer.alloc(CONFIG.CSV_MAX_SIZE)
    var idx = 0;

    s3.getObject({Bucket: CONFIG.IMPORT_BUCKET, Key: ticker})
    .on('httpData', chunk => {
      chunk.copy(buf, idx);
      idx += chunk.length;
    })
    .on('httpDone', () => {
      var res = buf.toString('UTF-8', 0, idx);
      fulfill(res);
    })
    .on('error', err => {
      error(err);
      reject(err);
    })
    .send();
  })
};

H.listS3 = function() {
  return new Promise((fulfill, reject) => {
    var s3 = new AWS.S3();
    s3.listObjects({Bucket: CONFIG.IMPORT_BUCKET, MaxKeys: 1000}, (err, data) => {
      if (err) reject(err);
      else {
        // exclude contents of 'sub-directories'
        var res = data.Contents.map(e => e.Key)
        res = res.filter( e => !(e.indexOf('/') > -1 ));
        fulfill(res);
      }
    });
  });
};

H.archiveS3 = function(ticker) {
  return new Promise((fulfill, reject) => {
    var s3 = new AWS.S3();
    s3.copyObject({Bucket: CONFIG.IMPORT_BUCKET,
                   Key: 'archive/' + ticker,
                   CopySource: CONFIG.IMPORT_BUCKET + '/' + ticker
    }, (err, data) => {
      if (err) reject(err);
      else {
        fulfill(ticker)
        s3.deleteObject({Bucket: CONFIG.IMPORT_BUCKET, Key: ticker}, (err, data) => {
          if (err) reject(err);
          else fulfill(ticker);
       });
      }
    });
 });
};

// exports
// =======

module.exports = H;
