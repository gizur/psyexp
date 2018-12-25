
// helpers.js

// imports and constants
// =======

const AWS = require('aws-sdk');
const MAX_SIZE = 10000


// Setup logging
// =============

const log = console.log.bind(console);
const debug = console.log.bind(console, 'DEBUG');
const info = console.info.bind(console);
const error = console.error.bind(console);


// Functions
// =========

var H = {};

// From: https://gist.github.com/jed/982883
H.uuid = function (
  a                  // placeholder
){
  return a           // if the placeholder was passed, return
    ? (              // a random number from 0 to 15
      a ^            // unless b is 8,
      Math.random()  // in which case
      * 16           // a random number from
      >> a/4         // 8 to 11
      ).toString(16) // in hexadecimal
    : (              // or otherwise a concatenated string:
      [1e7] +        // 10000000 +
      -1e3 +         // -1000 +
      -4e3 +         // -4000 +
      -8e3 +         // -80000000 +
      -1e11          // -100000000000,
      ).replace(     // replacing
        /[018]/g,    // zeroes, ones, and eights with
        H.uuid            // random hex digits
      )
}

// AWS S3 functions
// ----------------

H.saveS3 = function(bucket, params) {
  return new Promise((fulfill, reject) => {
    var s3 = new AWS.S3();
    //debug({Bucket: bucket, Key: params.filename, Body: params.data}, params);
    s3.putObject({Bucket: bucket, Key: params.filename, Body: params.data}, (err, data) => {
      if (err) reject(err);
      else {
        fulfill('Successfully uploaded ' + params.filename + ' data');
      }
    });
  });
};

H.getS3 = function(bucket, filename) {
  return new Promise((fulfill, reject) => {
    var s3 = new AWS.S3();
    var buf = Buffer.alloc(MAX_SIZE)
    var idx = 0;

    s3.getObject({Bucket: bucket, Key: filename})
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

H.listS3 = function(bucket) {
  return new Promise((fulfill, reject) => {
    var s3 = new AWS.S3();
    s3.listObjects({Bucket: bucket, MaxKeys: 1000}, (err, data) => {
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

H.archiveS3 = function(bucket, filename) {
  return new Promise((fulfill, reject) => {
    var s3 = new AWS.S3();
    s3.copyObject({Bucket: bucket,
                   Key: 'archive/' + filename,
                   CopySource: bucket + '/' + filename
    }, (err, data) => {
      if (err) reject(err);
      else {
        fulfill(filename)
        s3.deleteObject({Bucket: bucket, Key: filename}, (err, data) => {
          if (err) reject(err);
          else fulfill(filename);
       });
      }
    });
 });
};

// exports
// =======

module.exports = H;
