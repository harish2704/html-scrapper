var _ = require('underscore');
var async = require('async');
var request = require('request');



function Fetcher(urls, options) {
    this.urls = urls;
    this.options = options || {};
}

Fetcher.prototype.fetchUrl = function(name, cb ){
    return this.urls[name].read(cb);
}

exports.Fetcher = Fetcher;
