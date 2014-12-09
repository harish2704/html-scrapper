/*jslint node: true, stupid: true*/
/*global  */

var fs = require('fs');
var Cookie = require('tough-cookie');
var async = require('async');
var request = require('request');
var URL = require('url');
var _ = require('lodash');

var headers = {
'User-Argent' :'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/33.0.1750.152 Chrome/33.0.1750.152 Safari/537.36'
};

function Browser ( opts ){
    opts = opts || {};
    // Members
    // this.proxy = opts.proxy;
    this.headers = _.defaults({}, headers, opts.headers );
    this.jar = request.jar();
}


Browser.prototype.get = function( url, cb ){
    var opts;
    if( url.constructor.name == 'Object'){
        opts = _.clone(url);
        opts.headers = _.defaults( {}, this.headers, opts.headers );
    } else {
        opts = {
            url: url,
            headers: this.headers
        };
    }
    opts.jar = this.jar;
    // opts.proxy = this.proxy;
    return request.get(opts, cb);
};



module.exports = Browser;


