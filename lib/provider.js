/* jshint node:true */
"use strict";
var http = require('http');
var https = require('https');

function BaseProvider(rootUrl, name) {
    this.rootUrl = rootUrl;
    this.name = name;
}

BaseProvider.prototype.httpGet = function (url, callback) {
    var readResponse = function (response) {
        switch (response.statusCode) {
            case 301:
            case 302:
                http.get(response.headers.location, readResponse);
                break;
            case 200:
                var buffer = "";
                response.setEncoding('utf-8');
                response
                    .on('data', function (chunk) {buffer += chunk; })
                    .on('end', function() { process.nextTick(function () { callback(buffer); }); });
                break;
            default:
        }
    };
    http.get(url, readResponse);
};

BaseProvider.prototype.httpsGet = function (url, callback) {
    var readResponse = function (response) {
        switch (response.statusCode) {
            case 301:
            case 302:
                process.nextTick(function () {
                    http.get(response.headers.location, readResponse);
                });
                break;
            case 200:
                var buffer = "";
                response.setEncoding('utf-8');
                response
                    .on('data', function (chunk) {buffer += chunk; })
                    .on('end', function() { process.nextTick(function () { callback(buffer); }); });
                break;
            default:
        }
    };
    process.nextTick(function () { https.get(url, readResponse); });
};

exports.BaseProvider = BaseProvider;
