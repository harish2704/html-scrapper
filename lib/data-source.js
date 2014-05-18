var request = require('request');
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

var Source = function(action, url, query, data, cookie, headers, sep ){
    
    action = action || 'get';
    data = data || {};
    query = query || {};
    cookie = cookie || {};
    this.sep = sep || '&';
    this.headers = headers || {};

    this.action = action;
    this.url = url;
    this.query = query;
    this.cookie = cookie;
};

Source.prototype.read = function( query, data, cb ){
    switch (arguments.length ){
        case 1:
            cb = query;
            query = data = null;
            break;
        case 2:
            cb = data;
            data = null;
            break;
    }
    query = query || {};
    data = data || {};

    query = _.defaults( query, this.query );
    data = _.defaults( data, this.data);

    var url = getUrl(this.url, query, this.sep );
    var args = {
        url: url,
        data : JSON.stringify( data ),
        headers: this.headers
    };
    return request[this.action]( args, cb );
}



exports.Source = Source;
exports.getUrl = getUrl;
