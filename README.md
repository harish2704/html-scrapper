html-scrapper
=============

A general purpose web scrapper written in server side JavaScript. It is written for ease of use.

#Example 
Example of scrapping github's explore page.

```js

var scrapper = require('../');

var Source = scrapper.Source;
var Extractor = scrapper.Extractor;

function getInt (elem){
    return parseInt( elem.text().replace(',', '') );
}

var github = new Source('get', 'https://github.com/explore' );
var dataSchema = {
    trendingRepos:[ {
        $rule: '#explore-trending .explore-collection > ul > li',
        name: '.repo-name',
        forks: ':nth-child(1)',
        stars: {
            $rule: ':nth-child(2)',
            $fn: getInt
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
Documentation is not yet done.
see source code for undocumented features..

