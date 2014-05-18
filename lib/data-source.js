var request = require('request');
var URL = require('url');
var querystring = require('querystring');
var _ = require('underscore');


function getUrl (urlStr, q ){
    var url = URL.parse(urlStr);
    var qObject = querystring.parse( url.query );
    qObject = _.extend( qObject, q );
    url.search = '?' + querystring.stringify( qObject );
    return url.format();
}

var Source = function(action, url, query, data, cookie ){
    
    action = action || 'get';
    data = data || {};
    query = query || {};
    cookie = cookie || {};

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

    var url = getUrl(this.url, query );
    var args = {
        url: url,
        data : JSON.stringify( data )
    }
    return request[this.action]( args, cb );
}



exports.Source = Source;
exports.getUrl = getUrl;
