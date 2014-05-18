var should = require('should');
var dataSource = require('./data-source');
var dataExtractor = require('./data-extractor');
var fs = require('fs');
var cheerio = require('cheerio');
var _ = require('underscore');
var $ = cheerio;

var Source = dataSource.Source;
var getUrl = dataSource.getUrl;
var Extractor = dataExtractor.Extractor;

var sampleHtml = './data/github-explore.html';
var urlWithq = 'https://github.com/search?q=test';
var urlComplete = 'https://github.com/search?q=test&ref=cmdform';
var testQuery = {
    ref: 'cmdform'
};

var d = fs.readFileSync( sampleHtml, 'utf-8');
/*
var e = new Extractor(d);
var list = e.getList();
i = list[0];
var getItem = dataExtractor.getItem;
item = getItem(i);
*/
var getclass = getLink = function(){};
var testRule = {
    title: 'body>h3',
    list:[{
        $rule: 'body> ul > li',
        name: {$fn: getclass},
        href:{$fn: getLink}
    }],
    data: {
        $rule: '#info',
        phone: '#address > .phone',
        email: '#email'
    }
}
var getHref = function($){
    return $.attr().href;
}
var wRules = {
    trendingRepos:[ {
        $rule: '#explore-trending .explore-collection > ul > li',
        name: '.repo-name',
        stars: '.collection-stat > .octicon-star-add',
        forks: '.octicon-git-branch-create'
    } ]
}


describe('data-extractor', function(){
    
    describe('Extractor', function(){
        it('should initialize correctly', function(done){
            var e = new Extractor(testRule);
            should.exist(e.rules);
            // console.log( e.rules );
/*
 *             _.each( _.omit(e.rules, '$type'), function(rule){
 * 
 *                 rule.should.have.property('$fn');
 *                 rule.$fn.should.be.a.Function;
 *                 rule.should.have.property('$type');
 *                 should.equal(['Object', 'Array', 'function'].indexOf(rule.$type) != -1, true ); 
 *             })
 */
            return done();
        });

        it('should extract data', function(done){
            var e = new Extractor(wRules);
            var data = e.extract( d );
            // console.log( data );
            return done();
        });
    })
});

