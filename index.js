#!/usr/bin/env node

var logger = require('./lib/logger.js');
// var av = require('./lib/alienvault.js');
var et = require('./lib/emergingthreats.js');
var brocade = require('./lib/brocade.js');
var tor = require('./lib/tor.js');

var updateAVAddresses = function(callback) {
  av.getAddresses(null, function(error, data) {
    if (error) {
      callback(error, null);
    } else {
      if (data.length > 0) {
        brocade.updateBannedIPs(null, data, function(error, results) {
          callback(error, results);
        });
      }
    }
  });
};

var updateETAddresses = function() {
  et.getAddresses(null, function(error, data) {
    if (error) {
      callback(error, null);
    } else {
      if (data.length > 0) {
        brocade.updateBannedIPs(null, data, function(err, results) {
          if(err) {
            callback(err, null);
          } else {
            callback(null, results);
          }
        });
      }
    }
  });
};

var updateTorAddresses = function(callback) {
  tor.getAddresses(null, function(error, data) {
    if (error) {
      callback(error, null);
    } else {
      if (data.length > 0) {
        brocade.updateBannedIPs(null, data, function(err, results) {
          if(err) {
            callback(err, null);
          } else {
            callback(err, results);
          }
        });
      }
    }
  });
};

var callback = function(error, data) {
  if (error) {
    logger.error(error);
  } else {
    logger.info(data);
  }
};

// updateAVAddresses(callback);

updateETAddresses();

// updateTorAddresses(callback);
