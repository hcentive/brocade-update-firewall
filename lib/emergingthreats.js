var fs = require('fs');
var path = require('path');
var readline = require('readline');
var constants = require('constants');
var url = require('url');
var https = require('https');
var logger = require('./logger.js');
var http_proxy = require('https-proxy-agent');

var threatsURL = "https://rules.emergingthreats.net/fwrules/emerging-Block-IPs.txt";

var regex = new RegExp('^((?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(?:/(?:3[0-2]|[1-2][0-9]|[0-9]))?)');

var proxy = JSON.parse(fs.readFileSync(path.join('.', 'conf', 'default.json')));
if (proxy.proxy_enabled == "true") {
  var proxy_server = process.env.http_proxy || proxy.proxy_server;
  logger.debug("Proxy is enabled. Setting " + proxy_server + " as the proxy server");
  var agent = new http_proxy(proxy_server);
}

// Retrieves IP addresses to block from emergingthreats.net
exports.getAddresses = function(eturl, callback) {
  threaturl = eturl || threatsURL;
  var opts = url.parse(threaturl);
  if (agent) {
    opts.agent = agent;
  }
  var ranges = [];
  https.get(opts, function (response) {
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
      logger.debug(ranges.length + ' address ranges read from ' + threaturl);
      callback(null, ranges);
    });
  }).on('error', function (err) {
    logger.error('Error downloading ' + threaturl, err);
    callback(err);
  });
};
