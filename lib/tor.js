var path = require('path');
var readline = require('readline');
var constants = require('constants');
var https = require('https');
var logger = require('./logger.js');

var torURL = "https://check.torproject.org/exit-addresses";

var regex = new RegExp('^ExitAddress ((?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(?:/(?:3[0-2]|[1-2][0-9]|[0-9]))?)');

var options = {
  hostname: "check.torproject.org",
  path: "exit-addresses",
  method: 'GET',
  secureOptions: constants.SSL_OP_NO_TLSv1_2,
  rejectUnauthorized: false
};

// Retrieves IP addresses to block from https://check.torproject.org/exit-addresses
exports.getAddresses = function(url, callback) {
  threaturl = url || torURL;
  var ranges = [];
  var body = "";

  https.get(torURL, function (response) {
    // create a reader object to read the list one line at a time
    var reader = readline.createInterface({ terminal: false, input: response });
    reader.on('line', function (line) {
      var result = regex.exec(line);
      // if there is a result, a range has been found and a new range is created
      if (result) {
        if (ranges.indexOf(result[1]) === -1) {
          if (result[1].indexOf('/') === -1) {
            result[1] += '/32';
          }
          ranges.push(result[1]);
        }
      }
    });
    reader.on('close', function () {
      console.log(ranges.length + ' address ranges read from ' + torURL);
      callback(null, ranges);
    });
  }).on('error', function (err) {
    console.error('Error downloading ' + torURL, err);
    callback(err);
  });
};
