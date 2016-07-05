var av = require('./lib/alienvault.js');
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

var updateETAddresses = function(callback) {
  et.getAddresses(null, function(error, data) {
    if (error) {
      callback(error);
    } else {
      if (data.length > 0) {
        brocade.updateBannedIPs(null, data, function(err, results) {
          callback(err, results);
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
    console.log(error, error.stack);
  } else {
    console.log(data);
    // console.log(data);
  }
};

// updateAVAddresses(callback);

updateETAddresses(callback);

// updateTorAddresses(callback);
