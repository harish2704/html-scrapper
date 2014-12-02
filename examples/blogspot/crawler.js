/*jslint node: true, stupid: true*/
/*global describe, it */



var scrapper = require('../../');
var async = require('async');
var querystring = require('querystring');
var util = require('util');
var fs = require('fs');
var BufferedSink = require('buffered-sink');
var _ = require('lodash');


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


var indexPageUrl = 'http://yogavasishtamnithyaparayanam.blogspot.ca/';
var urlFormat = 'http://yogavasishtamnithyaparayanam.blogspot.ca/?action=getTitles&widgetId=BlogArchive1&widgetType=BlogArchive&responseType=js&path=%s';
var b = new Browser();
var loadPageList = function( bundle, cb ){
    console.log( 'loadPageList' );
    async.waterfall([
            function( cb ){
                if ( !bundle.totalMonths ){
                    return b.get( indexPageUrl, function(err, res, html ){
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
                return b.get( url, cb );
            },
            function( res, script, cb ){
                var data;
                global._WidgetManager = { _HandleControllerResult: function(a,b,c){ data = c; } };
                var f = new Function( script );
                f();
                ++bundle.firstUnprocessed;
                bundle.$endReached = bundle.totalMonths.length === bundle.firstUnprocessed;
                return cb( null, data.posts );
            }
            ], cb );
};

var scrapePage = function( item, cb ){
    var url = item.url;
    console.log( 'scrapePage', item );
    async.waterfall([
            function(cb){
                return b.get(url, cb );
            },
            function(res, html, cb ){
                var data = ePost.extract( html );
                data.url = url;
                data.urlTitle = url.title;
                data.html = html;
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
    concurrency: 10,
    loadPageList: loadPageList,
    scrapePage: scrapePage,
    bs: bs,
    pageListFilter: pageListFilter,
    onError: function(){ console.log('Error occurred', arguments ); },
    onFinish: function(){ console.log('Finished', arguments ); }
});
crawler.start();


