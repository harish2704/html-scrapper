/*jslint node: true, stupid: true*/




var scrapper = require('../../');
var async = require('async');
var querystring = require('querystring');
var util = require('util');
var fs = require('fs');
var BufferedSink = require('buffered-sink');
var _ = require('lodash');
var L = require('debug')('Crawler');


var Source = scrapper.Source;
var Extractor = scrapper.Extractor;
var Fn = scrapper.Fn;
var Browser = scrapper.Browser;
var Crawler = scrapper.Crawler;

var ePosts = new Extractor({
    monthUrls: [{
        $rule: '#BlogArchive1_ArchiveList > ul.hierarchy > li.archivedate > ul.hierarchy > li.archivedate > a.post-count-link',
        $fn: Fn.link
    }]
});

var ePost = new Extractor({
    date: '.date-header',
    title: '[itemprop="name"]',
    body: 'div[itemprop="articleBody"]'
});

var headers = {
    'Accept'             : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    Host                 : "yogavasishtamnithyaparayanam.blogspot.ca",
    // 'Accept-Encoding' : 'gzip,deflate,sdch',
    'Accept-Language'    : 'en-US,en;q=0.8',
    'Cache-Control'      : 'no-cache',
    'Connection'         : 'keep-alive',
    'If-Modified-Since'  : 'Tue, 20 Jan 2015 01                                                                                                                     : 57 : 22 GMT',
    // 'Pragma'          : 'no-cache',
    'User-Agent'         : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/43.0.2357.81 Chrome/43.0.2357.81 Safari/537.36',
};
var b = new Browser( { headers: headers });

var indexPageUrl = 'http://yogavasishtamnithyaparayanam.blogspot.ca/';
var urlFormat = 'http://yogavasishtamnithyaparayanam.blogspot.ca/?action=getTitles&widgetId=BlogArchive1&widgetType=BlogArchive&responseType=js&path=%s';
var loadPageList = function( args, cb ){
    if( this.scratchPad === undefined ){
        this.scratchPad = {};
    }
    var bundle = this.scratchPad;
    var self = this;
    async.waterfall([
            function( cb ){
                if ( !bundle.totalMonths ){
                    L('Getting indexPage', indexPageUrl );
                    return b.get( indexPageUrl, function(err, res, html ){
                        L('Got indexPage' );
                        if(err) { return cb(err); }
                        bundle.totalMonths = ePosts.extract( html ).monthUrls;
                        return cb( );
                    });
                }
                return cb();
            },
            function( cb ){
                if ( bundle.firstUnprocessed === undefined ){
                    bundle.firstUnprocessed = 0;
                }
                var toBeProcessed = bundle.totalMonths[bundle.firstUnprocessed];
                var url = util.format( urlFormat, querystring.escape( toBeProcessed ) );
                L('Getting page', url );
                return b.get( url, cb );
            },
            function( res, script, cb ){
                L('Got page', res.request.uri.href );
                var data;
                global._WidgetManager = { _HandleControllerResult: function(a,b,c){ data = c; } };
                var f = new Function( script );
                f();
                ++bundle.firstUnprocessed;
                self.$endReached = bundle.totalMonths.length === bundle.firstUnprocessed;
                L('Got ', data.posts.length, ' Items');
                return cb( null, data.posts );
            }
            ], cb );
};

var scrapePage = function( item, cb ){
    var url = item.url;
    L( 'scrapePage', item );
    async.waterfall([
            function(cb){
                return b.get(url, cb );
            },
            function(res, html, cb ){
                var data = ePost.extract( html );
                data.url = url;
                data.urlTitle = url.title;
                //~ data.html = html;
                return cb( null, data );
            }
            ], cb );
};
var outFile = './out.json' ;
var bs = new BufferedSink( {
    maxSize: 5,
    writeItems: function(items, cb){
        var existing;
        try {
            existing = JSON.parse( fs.readFileSync( outFile, 'utf-8' ) );
        } catch(e){
            existing = [];
        }
        var total = existing.concat( items );
        fs.writeFile( outFile, JSON.stringify(total, null, ' '), 'utf-8', cb );
    }
});

try{
    var scrapedItems = fs.readFileSync(outFile, 'utf-8' );
    scrapedItems = JSON.parse(scrapedItems);
    scrapedItems = _.pluck( scrapedItems, 'url' );
} catch(e){
    var scrapedItems = [];
}


var pageListFilter = function( items, cb){
    var filtered = items.filter( function(v){
        return scrapedItems.indexOf( v.url ) === -1;
    });
    return cb( null, filtered );
};

var crawler = new Crawler({
    concurrency: 9,
    loadPageList: loadPageList,
    scrapePage: scrapePage,
    sink: bs,
    pageListFilter: pageListFilter,
    onError: function(){ L('Error occurred', arguments ); },
});

crawler.scrap( null, function(err){
    L( 'Finished Success: ', Boolean(err) );
});


