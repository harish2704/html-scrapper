var request = require('request');
request = request.defaults({jar: true});
var URL = require('url');
var querystring = require('querystring');
var _ = require('underscore');


function getUrl (urlStr, q, sep ){
    var url = URL.parse(urlStr);
    var qObject = querystring.parse( url.query, sep );
    qObject = _.extend( qObject, q );
    url.search = '?' + querystring.stringify( qObject, sep );
    return url.format();
}

var Source = function(action, url, opts ){
    action = action || 'get';
    opts = opts || {};
    this.query = opts.query || {};
    this.data = opts.data || {};
    this.headers = opts.headers || {};
    this.cookie = opts.cookie || {};
    this.vars = opts.vars || {};
    this.sep = opts.sep || '&';

    this.action = action;
    this.url = url;
};

Source.prototype.read = function( data, cb ){
    if(!cb) cb = data;
    var self = this;
    var newData = {};
    newData.query = {};
    newData.data = {};
    newData.headers = {};
    newData.cookie = {};

    Object.keys(data).forEach(function(k){
        var v = data[k];
        var varItem = self.vars[k];
        newData[varItem][k] = v;
    });

    newData.query = _.defaults( newData.query, this.query );
    newData.data = _.defaults( newData.data, this.data );
    newData.headers = _.defaults( newData.headers, this.headers );
    newData.cookie = _.defaults( newData.cookie, this.cookie );

    var url = getUrl(this.url, newData.query, this.sep );
    var args = {
        url: url,
        data : JSON.stringify( newData.data ),
        headers: newData.headers
    };
    return request[this.action]( args, cb );
}



exports.Source = Source;
exports.getUrl = getUrl;
