var fs = require('fs');
var path = require('path');
var constants = require('constants');
var https = require('https');
var logger = require('./logger.js');

var brocade = JSON.parse(fs.readFileSync(path.join('.', 'conf', 'brocade.json.dev')));

// Creates HTTP request options for specified service protection class and HTTP method.
var options = function (protectionClass, m){
  return {
    hostname: brocade.api_host,
    port: brocade.api_port,
    path: brocade.api_context_start + "/" + brocade.api_version + brocade.service_protection_endpoint + "/" + protectionClass,
    headers: {
      'content-type': 'application/json'
    },
    method: m,
    secureOptions: constants.SSL_OP_NO_TLSv1_2,
    rejectUnauthorized: false,
    auth: brocade.api_user + ":" +brocade.api_password
  };
};

// Returns an array of banned IPs for specified service protection class
exports.getBannedIPs = function (protectionClass, callback){
  var body = "";
  var bannedIPs = [];

  var req = https.request(options(protectionClass, 'GET'), (res) => {
    res.on('data', (d) => {
      body += d;
    });

    res.on('end', () => {
      var json = JSON.parse(body);

      var banned = json.properties.access_restriction.banned;

      banned.forEach(function(result) {
        bannedIPs.push(result);
      });
      // callback(null, bannedIPs);
    });
  });

  req.on('error', function(e) {
    callback(e, null);
  });

  req.end(callback(null, bannedIPs));
};

// Removes all IP addresses from banned IP addresses array in the specified service protection class.
var deleteAllAddresses = function(protectionClass, callback) {
  var body = "";
  var json = null;

  var req = https.request(options(protectionClass, 'PUT'), (res) => {
    res.on('data', (d) => {
      body += d;
    });

    res.on('end', () => {
      var json = JSON.parse(body);
      json.properties.access_restriction.banned = [];
      // callback(null, json);
    });
  });

  req.on('error', function(e) {
    callback(e, null);
  });

  req.end(callback(null, json));
};

// Creates a new service protection class
var createProtectionClass = function(protectionClass, data, callback) {
  var body = "";

  var req = https.request(options(protectionClass, 'PUT'), (res) => {
    res.on('data', (d) => {
      body += d;
    });

    res.on('end', () => {
      logger.debug(body);
    });
  });

  req.write(data);

  req.on('error', function(e) {
    callback(e, null);
  });

  req.end(callback(null, body));
};

// Creates JSON payload with specified banned IP addresses.
// The Brocade API does not support adding or updating banned IP addresses list.
// So, replace existing addresses wth new ones.
var createBannedPayload = function (bannedIPs, protectionClass, callback) {
  var body = "";

  var req = https.request(options(protectionClass, 'GET'), (res) => {
    res.on('data', (d) => {
      body += d;
    });

    res.on('end', () => {
      var json = JSON.parse(body);
      json.properties.access_restriction.banned = bannedIPs;
      callback(null, json);
    });
  });

  req.on('error', function(e) {
    callback(e, null);
  });

  req.end(callback(null, body));
};

// Create a copy of the specified service protection class
var backupProtectionClass = function(protectionClass, callback) {
  protectionClass = protectionClass || brocade.protection_class;

  // Backup existing protection class
  logger.debug("Backing up " + protectionClass + " to " + brocade.protection_class_backup);

  // Get protection class JSON
  var body = "";
  var req = https.request(options(protectionClass, 'GET'), (res) => {
    res.on('data', (d) => {
      body += d;
    });

    res.on('end', () => {
      logger.debug(body);
      // Create a backup protection class with the supplied JSON specification
      createProtectionClass(brocade.protection_class_backup, body);
    });
  });

  req.on('error', function(e) {
    callback(e, null);
  });

  req.end(callback(null, body));
};

// Updates banned IPs for specified service protection class with supplied addresses.
exports.updateBannedIPs = function(protectionClass, addresses, callback) {
  protectionClass = protectionClass || brocade.protection_class;

  // Replace existing banned IP addresses with new addresses
  logger.info("Updating " + protectionClass + " with " + addresses.length + " addresses");
  createBannedPayload(addresses, protectionClass, function(error, results) {
    if (error) {
      callback(error, null);
    } else {
      var body = "";
      var req = https.request(options(protectionClass, 'PUT'), (res) => {
        res.on('data', (d) => {
          body += d;
        });

        res.on('end', () => {
          // logger.info(JSON.stringify(body));
        });
      });

      req.write(JSON.stringify(results));

      req.on('error', function(e) {
        callback(e, null);
      });

      req.end(() => {
        callback(null, "Updated " + protectionClass + " with " + addresses.length + " addresses");
      });
    }
  });
};
