html-scrapper
=============

A general purpose web scrapper written in server side JavaScript. It is written for ease of use.

#Example 
Example of scrapping github's explore page.

```js

var scrapper = require('../');

var Source = scrapper.Source;
var Extractor = scrapper.Extractor;
var Fn = scrapper.Fn;


var github = new Source('get', 'https://github.com/explore' );
var dataSchema = {
    trendingRepos:[ {
        $rule: '#explore-trending .explore-collection > ul > li',
        name: '.repo-name',
        forks: ':nth-child(1)',
        stars: {
            $rule: ':nth-child(2)',
            $fn: Fn.asInt
        }
    }]
};

var extractor = new Extractor( dataSchema );
github.read(function(err, res ){
    var data = extractor.extract( res.body );
    console.log( data );
});

/*
Returns

{ trendingRepos: 
   [ { name: 'calmh/syncthing', forks: '77', stars: 2019 },
     { name: 'quilljs/quill', forks: '47', stars: 1312 },
     { name: 'filamentgroup/tablesaw', forks: '31', stars: 1128 },
     { name: 'atom/atom', forks: '142', stars: 1035 },
     { name: 'dennis714/RE-for-beginners', forks: '67', stars: 1072 },
     { name: 'mdo/wtf-forms', forks: '43', stars: 912 } ] }

*/

```

#Usage

## Collection Fn

Fn contains some usefull data extraction functions that can be used as $fn.

Available functions:

1. text
    * trimmed text content
2. link 
    * href attribute
3. data 
    * data-name=value is returned as {name: value}
4. classes 
    * class attribute
5. asInt 
    * text is parsed as integer. all comas are removed
6. asFloat
    * same as asInt but casts to Float.

## Class Browser
A simple Browser class implementation. It uses `request` module for http requests and stores session data in its instance.
Only `get` method is implemented right now.

## Class Crawler
A simple web Crawler class. It uses the following libraries
* [job-manage](https://github.com/harish2704/node-job-manager): It is the backbone of Crawler. JobManager is a asynchronous queue manager library. It is used to automatically collect pageUrls, scrap each pages, manage concurrency and to start, pause and resume the crawling.
* [BufferedSink](https://github.com/harish2704/node-buffered-sink): Used to write the scraped data.

It need following data to be passed to its constructor.

* `loadPageList`: A function with signature `function( pageLoaderData, cb )`. It is used to collect urls of pages that need to be scraped.
    * pageLoaderData: A normal Object used to store any arbitrary data by this function.
    if `bundle.$endReached` is set `true`, then it will stop furthon invocation of loadPageList function.
    * cb: A callback function with signature`function(err, [ pageData, ... ])`
* `scrapePage`: A function `function( pageData, cb)`. 
    * pageData: single item from the collection passed to callback function of loadPageList function.
    * cb: callback function.
* `bs`: A BufferedSink instance used to write the data to output medium. See examples/blogspot  for a simple implementation that appends data to a json file
* `pageListFilter`: An optional function. It it is present, all output from loadPageList function is passed through this function. Even if filtered output is empty we need not to worry about that, Crawler will manage that by repeated calling of loadPageList function until it gets some data or loadPageList function returns an empty result.
* `onError`: a function `function(err)` called upon error. It will not stop the Crawler.
* `onFinish`: a function called upon the completion of whole tasks.
* `concurrency`: no.of parallel requests to processed during scraping.

See the `examples/blogspot/` for an example crawler that scraps whole posts from a blogspot blog and dumps into a json file.

## Class Source

## Class Extractor

## Class Fetcher


Documentation is not yet done.
see source code for undocumented features..

