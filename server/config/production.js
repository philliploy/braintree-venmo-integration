// settings
var path = require('path');
var rootPath = path.join(__dirname, '/../..');
var staticPath = path.join(__dirname, '/../../client/build/');
var fs = require('fs');
var rawdata = fs.readFileSync(__dirname + '/braintree.json');  
var braintree = JSON.parse(rawdata);

var settings = {
	rootPath: rootPath,
	staticPath: staticPath,
	envPath: __dirname,
	port: 1234,
	bodyLimit: '100kb',
	braintree: braintree,
};

module.exports = settings;
