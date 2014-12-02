/*jslint node: true, stupid: true*/
/*global  */

var _ = require('lodash'),
    async = require('async'),
    L = console;
var JobManager = require('job-manager').JobManager;
var Browser = require('./Browser');


/**
 * Crawler
 *
 * @param args arguments to the constructor
 * @param {Integer} concurrency: maximum number of parallel network operations
 * @param {function} getPageList a function with signature getPageList( cb ) that asynchronously returns a new batch of page urls to be crawled.
 * @param {function} crawlPage a function with signature crawlPage( url, cb ) that asynchronously extracts the data from a url
 * @param {function} onError a function with signature onError( err, url, worker ). It is called when an error is occurred during the crawling process.
 * @param {function} onStopped a function with onStopped() is called when the Crawler stops its working after successfully crawling all its targets.
 * @param {BufferedSink} sink An instance of BufferedSink class that is used by Crawler to save the extracted data.
 * @return
 */
function Crawler( args ){
    var cObject = this;
    this.pageLoaderData = {};
    this.loadPageList = args.loadPageList;
    this.pageListFilter = args.pageListFilter;
    this.bs = args.bs;
    this.scrapePage = args.scrapePage;
    this.onError = args.onError;
    this.onFinish = args.onFinish;
    this.concurrency = args.concurrency;

    var jm = new JobManager( { concurrency:  args.concurrency });
    var workers = [ ];
    _.range(0, args.concurrency ).forEach(function(v){
        workers.push( new Browser() );
    });
    jm.workers = workers;
    jm.onLoadMore = function( cb ){
        var newUrls = [];
        async.until(
                function () {
                    var shouldContinue = newUrls.length || jm.endReached;
                    shouldContinue = Boolean( shouldContinue );
                    return shouldContinue; 
                },
                function( cb ) {
                    async.waterfall([
                        function(cb){
                            cObject.loadPageList( cObject.pageLoaderData, cb );
                        },
                        function(data, cb ){
                            if( !data.length || cObject.pageLoaderData.$endReached ){
                                jm.endReached = true;
                                L.info('onLoadMore', 'Last page reached.');
                                if(!data.length){
                                    return cb( null, data );
                                }
                            }
                            if( cObject.pageListFilter ){
                                L.info( 'filtering Urls');
                                return cObject.pageListFilter( data, cb );
                            }
                            return cb( null, data);
                        },
                        ], function(err, data){
                            if( err ) { 
                                L.error('onLoadMore ', err, data );
                                data = [];
                            }
                            newUrls =data;
                            return cb();
                        });
                },
                function(err){
                    jm.tasks = jm.tasks.concat( newUrls );
                    cb();
                });
    };
    jm.work = function( itemPointer, worker, cb ){
        async.waterfall([
                function(cb){
                    cObject.scrapePage( itemPointer, cb );
                },
                function(data, cb ){
                    return cObject.bs.write( data, cb );
                },
                ], cb );
    };
    jm.onStopped = function(){
        L.info('scrapAllItems Finished' );
        return cObject.bs.flush( function() {
            return cObject.onFinish();
        });
    };
    jm.onError = function( err, task, worker ){
        cObject.onError( 'jm.onError', err, task, worker);
    };
    this.jm = jm;
}

Crawler.prototype.start = function(  ){
    this.jm.start();
};

Crawler.prototype.pause = function(  ){
    this.jm.pause();
};

Crawler.prototype.resume = function(  ){
    this.jm.resume();
};


module.exports = Crawler;
