/* jshint node:true */
"use strict";
var fs = require('fs');
var JSZip = require('jszip');
var restify = require('restify');
var providers = require('./lib/providers');
var http = require('http');

var curse = new providers.Curse();
var kerbalstuff = new providers.KerbalStuff();
var multi = new providers.Multi([curse, kerbalstuff]);

var server = restify.createServer();
server.use(restify.CORS());
//server.use(restify.fullResponse());
server.get('/search/:query', function (req, res, next) {
    multi.search(req.params.query, function (results) {
        var augmented = results.map(function (r) {
            r.releases_url = server.router.render('releases', {provider: r.provider, id: r.id});
            return r;
        });
        res.send(augmented);
        next();
    });
});

server.get({name: 'releases', path: '/releases/:provider/:id'}, function (req, res, next) {

    multi.releases({id: req.params.id, provider: req.params.provider}, function (releases) {
        if (releases.length === 0)
            res.send(204);
        else
            res.send(releases);
        next();
    });
});

server.listen(parseInt(process.env.PORT) || 8000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
