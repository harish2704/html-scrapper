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
available functions:
    1. text => trimmed text content
    2. link => href attribute
    3. data => data-name=value is returned as {name: value}
    4. classes => class attribute
    5. asInt => text is parsed as integer. all comas are removed
    6. asFloat same as asInt but casts to Float.
## Class Source
## Class Extractor
## Class Fetcher
Documentation is not yet done.
see source code for undocumented features..

