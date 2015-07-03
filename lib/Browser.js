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




/**
 * A simple class imitating a web-browser. It can be considered as a wrapper around famous 'request' module.
 * Current implementation is very limited . 
 * Only get method is implemented. It can be done very easily.
 *
 * @param {Object} opts - Option object.
 * @param {Object} opts.headers - [optional] additional headers used for all requests.
 * default:
 * ```js
 *
 * var headers = {
 * 'User-Argent' :'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/33.0.1750.152 Chrome/33.0.1750.152 Safari/537.36'
 * };
 * ```
 * @param {String} opts.proxy - [optional] proxy parameter that will be passed to request module.
 * default: null
 * @param {tough.CookieJar} jar - [optional] Cookie.jar instance used for for the Browser. default ```request.jar()```
 * It should be an instance of 'tough-cookie' jar;
 * @return {undefined}
 * @class
 */
function Browser ( opts ){
    opts = opts || {};
    // Members
    this.headers = _.defaults({}, headers, opts.headers );
    this.proxy   = opts.proxy;
    this.jar     = opts.jar || request.jar();
}


/**
 * make a HTTP/GET request.
 *
 * @param {String|Object} opts - If url a string is given, It is used as URL string. Else, It is passed to request.get with instance specific headers and jar settings.
 * @param {function} cb - callback function. passed directly to request.get.
 * @return {request}
 */
Browser.prototype.get = function( opts, cb ){
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
    opts.proxy = this.proxy;
    return request.get(opts, cb);
};



module.exports = Browser;


