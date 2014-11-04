/* jshint node:true */
"use strict";
var qs = require('querystring');
var cheerio = require('cheerio');
var provider = require('../provider.js');
var events = require('events');

function CurseProvider() {
    provider.BaseProvider.call(this, 'http://kerbal.curseforge.com/', 'curse');
}

CurseProvider.prototype = Object.create(provider.BaseProvider.prototype);
CurseProvider.prototype.constructor = CurseProvider;
CurseProvider.prototype.search = function(query, callback) {
    var searchUrl = this.rootUrl + 'search?' + qs.stringify({'search': query});
    var emitter = new events.EventEmitter();
    var provider_name = this.name;
    console.log(searchUrl);
    this.httpGet(searchUrl, function (buffer) {
        var $ = cheerio.load(buffer, {normalizeWhitespace: true});
        var results = [];
        $('tr.results:has(a[href^="/ksp-mods"])').each(function () {
            var $link = $(this).find('.results-name a[href^="/ksp-mods"]');
            var id = $link.attr('href').trim().match(/^\/ksp-mods\/(.+)$/)[1];
            var summary = $(this).find('td .results-summary').text().trim();
            var result = {name: $link.text().trim(), id: id, summary: summary, provider: provider_name};
            results.push(result);
            emitter.emit('result', result);
        });

        if (callback)
            process.nextTick(function() { callback(results); });
    });

    return emitter;
};
CurseProvider.prototype.releases = function(mod, callback) {
    var releasesUrl = this.rootUrl + 'ksp-mods/' + mod.id + '/files';
    var emitter = new events.EventEmitter();
    console.log(releasesUrl);
    this.httpGet(releasesUrl, function (buffer) {
        var $ = cheerio.load(buffer, {normalizeWhitespace: true});
        var results = [];
        $('.listing-project-file tbody tr.project-file-list-item').each(function () {
            var release_type = $(this).find('.project-file-release-type div')
                                    .attr('class').split('-')[0];
            var $project_name = $(this).find('.project-file-name');
            var game_version = $(this).find('.project-file-game-version .version-label').text().trim();
            var download_link = $project_name.find('.project-file-download-button a').attr('href');
            var release_name = $(this).find('.project-file-name-container').text().trim();
            var result = {name: release_name, url: download_link, game: game_version};
            results.push(result);
            emitter.emit('result', result);
        });

        if (callback)
            process.nextTick(function () { callback(results); });
    });
    return emitter;
};

exports.CurseProvider = CurseProvider;
