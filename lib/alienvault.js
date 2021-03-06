var fs = require('fs');
var constants = require('constants');
var https = require('https');
var _ = require('underscore');
var path = require('path');
var logger = require('./logger.js');

var av = JSON.parse(fs.readFileSync(path.join('.', 'conf', 'alienvault.json')));

//get IP addresses from Alienvault
exports.getAddresses = function(path, callback, addresses) {
  otx_path = path || av.otx_start_path;
  var options = {
    hostname: av.otx_host,
    path: otx_path,
    method: 'GET',
    secureOptions: constants.SSL_OP_NO_TLSv1_2,
    headers: {'X-OTX-API-KEY': av.otx_api_key}
  };

  var body = "";
  addresses = addresses || [];

  var req = https.request(options, (res) => {
    res.on('data', (d) => {
      body += d;
    });

    res.on('end', () => {
      var json = JSON.parse(body);
      var next = json.next;
      var results = json.results;
      // results.forEach(filterIPv4Indicators);
      results.forEach(function(result) {
        var indicator = _.where(result.indicators, {type: "IPv4"});
        indicator.forEach(function(i){
          var a = i.indicator;
          if (a.indexOf('/') === -1) {
            a += '/32';
          }
          if (addresses.indexOf(a) === -1) {
            addresses.push(a);
          }
        });
      });

      if (next != null) {
        this.getAddresses(next, callback, addresses);
      } else {
        callback(null, addresses);
      }
    });
  });

  req.on('error', (e) => {
    console.error(e);
    callback(e, null);
  });

  req.end();
};
