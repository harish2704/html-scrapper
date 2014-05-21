var should = require('should');
var dataSource = require('./data-source');

var Source = dataSource.Source;
var getUrl = dataSource.getUrl;

var urlWithq = 'https://github.com/search?q=test';
var urlComplete = 'https://github.com/search?q=test&ref=cmdform';
var testQuery = {
    ref: 'cmdform'
};

describe('data-source', function(){

    describe('static functions', function(){
        it('should add the given queries to given url', function(done){
            var url = getUrl( urlWithq, testQuery );
            should.exist( url );
            url.should.be.equal(urlComplete);
            return done();
        });
    });

    describe('Source', function(){
        it('should read source', function(done){
            var s = new Source('get', urlWithq );
            s.read(function(err, res){
                should.not.exist(err);
                should.exist(res);
                res.should.have.property('body');
                return done();
            });
        });
        it('should accepts options', function(done){
            var args = {
                vars:{
                    q: 'query',
                    p: 'query'
                }
            };
            var src = new Source('get', 'https://github.com/search?p=5&q=test&type=Repositories', args );

            src.read({p:1}, function(err, res){
                // console.log( 'url: ', res.request.url );
                // console.log( Object.keys(res.request));
                // console.log( res.request.uri );
                return done();
            });
        });
    });
});
