/* jshint node:true */
"use strict";
var provider = require('../provider');
var qs = require('querystring');
var events = require('events');
function KerbalStuffProvider() {
    provider.BaseProvider.call(this, 'https://kerbalstuff.com/api/', 'kerbalstuff');
}

KerbalStuffProvider.prototype = Object.create(provider.BaseProvider.prototype);
KerbalStuffProvider.prototype.constructor = KerbalStuffProvider;
KerbalStuffProvider.prototype.search = function(query, callback) {
    var searchUrl = this.rootUrl + 'search/mod?' + qs.stringify({'query': query});
    console.log(searchUrl);
    var emitter = new events.EventEmitter();
    var provider_name = this.name;
    this.httpsGet(searchUrl, function (buffer) {
        var data = JSON.parse(buffer);
        var results = [];
        data.forEach(function (raw) {
            var result = {name: raw.name, id: raw.id, summary: raw.short_description, provider: provider_name};
            results.push(result);
            emitter.emit('result', result);
        });

        if (callback)
            process.nextTick(function() { callback(results); });
    });

    return emitter;
};

KerbalStuffProvider.prototype.releases = function(mod, callback) {
    var releasesUrl = this.rootUrl + 'mod/' + mod.id;
    var emitter = new events.EventEmitter();
    console.log(releasesUrl);
    this.httpsGet(releasesUrl, function (buffer) {
        var data = JSON.parse(buffer);
        var results = [];
        data.versions.forEach(function (version) {
            var result = {name: version.friendly_version, url: version.download_path, game: version.ksp_version};
            results.push(result);
            emitter.emit('result', result);
        });

        if (callback)
            process.nextTick(function () { callback(results); });
    });

    return emitter;
};

exports.KerbalStuffProvider = KerbalStuffProvider;
