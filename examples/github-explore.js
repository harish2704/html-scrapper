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

