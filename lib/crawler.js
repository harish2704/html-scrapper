"use strict";
/*jslint node: true, stupid: true*/
/*global  */

var _ = require('lodash'),
    async = require('async'),
    L = console;
var JobManager = require('job-manager').JobManager;
var Browser = require('./Browser');


/**
 * Crawler
 * @param {Object} args arguments to the constructor
 *
 * @param {Integer} args.concurrency maximum number of parallel network operations
 *
 * @param {function} args.loadPageList a function with signature loadPageList( cb ) that asynchronously returns a new batch of page urls to be crawled. When loadPageList returns an empty array, it is considered as end of page and Crawler will stop its execution when scraping of all loaded pages finishes.
 *
 * @param {function} pageListFilter a function with signature pageListFilter( data, cb ). If provided, all data returned by loadPageList will be filtered through this function. Why this can not be included in loadPageList function is that, If loadPageList returns an empty list, it is considered as end of page and crawler will stop the execution . But if the filtered output is zero, it is not accounted as end of page. instead, crawler will call loadPageList until it returns a empty list or we get non-empty filtered data .If this process takes longer time, and all loaded tasks are already processed, then Crawler will pause its execution and resumes when it get data .
 *
 * @param {function} args.scrapePage a function with signature scrapePage( url, cb ) that asynchronously extracts the data from a url
 * @param {function} args.onError a function with signature onError( err, url, worker ). It is called when an error is occurred during the crawling process.
 * 
 * @param {function} args.onStopped a function with signature onStopped() is called when the Crawler stops its working after successfully crawling all its targets.
 * 
 * @param {BufferedSink} args.sink An instance of BufferedSink class that is used by Crawler to save the extracted data.
 */
function Crawler( args ){
    this.concurrency = args.concurrency;
    this.loadPageList = args.loadPageList;
    this.pageListFilter = args.pageListFilter;
    this.scrapePage = args.scrapePage;
    this.onError = args.onError;
    this.sink = args.sink;
}

Crawler.prototype.scrap = function( args, cb ){
    var cObject = this;
    var jm = new JobManager( { concurrency:  this.concurrency, logLevel: 2 });
    var workers = [ ];
    _.range(0, this.concurrency ).forEach(function(v){
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
                            cObject.loadPageList( args, cb );
                        },
                        function(data, cb ){
                            if( !data.length || cObject.$endReached ){
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
                            L.info('Filtered urls count: ', newUrls.length );
                            return cb();
                        });
                },
                function(err){
                    jm.tasks = jm.tasks.concat( newUrls );
                    cb();
                });
    };
    jm.work = function( item, worker, cb ){
        async.waterfall([
                function(cb){
                    cObject.scrapePage( item, cb );
                },
                function(data, cb ){
                    return cObject.sink.write( data, cb );
                },
                ], cb );
    };
    jm.onStopped = function(){
        L.info('scrapAllItems Finished' );
        return cObject.sink.flush( function() {
            return cb();
        });
    };
    jm.onError = function( err, task, worker ){
        cObject.onError( 'jm.onError', err, task, worker);
    };
    jm.start();
    return jm;
};

module.exports = Crawler;
