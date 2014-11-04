/* jshint node:true */
"use strict";
var qs = require('querystring');
var cheerio = require('cheerio');
var provider = require('../provider.js');
var events = require('events');

function MultiProvider(providers) {
    provider.BaseProvider.call(this, 'http://kerbal.curseforge.com/', 'curse');
    this.providers = providers;
}

MultiProvider.prototype = Object.create(provider.BaseProvider.prototype);
MultiProvider.prototype.constructor = MultiProvider;
MultiProvider.prototype.search = function(query, callback) {
    var results = [];
    var emitter = new events.EventEmitter();
    var receiver = new events.EventEmitter();
    var acks = 0;

    this.providers.forEach(function (provider) {
        provider.search(query, function (providerResults) {
            results = results.concat(providerResults);
            receiver.emit('ack');
        })
            .on('result', emitter.emit.bind(emitter, 'result'));
    });

    receiver.on('ack', function () {
        acks += 1;

        if (acks === this.providers.length && callback)
            process.nextTick(function () { callback(results); });
    }.bind(this));

    return emitter;
};
MultiProvider.prototype.releases = function(mod, callback) {
    var provider = this.providers.filter(function (p) { return p.name === mod.provider; });

    if (provider.length)
        return provider[0].releases(mod, callback);

    return null;
};

exports.MultiProvider = MultiProvider;
