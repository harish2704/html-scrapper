var cheerio = require('cheerio');
var _ = require('underscore');

function text($){
    return $.text();
}

var parseRule = function( val ){
    var rule = {};
    rule.$type = val.constructor.name;
    switch( rule.$type ){
        case 'String':
            rule.$fn = text;
            rule.$rule = val;
            rule.$type = 'function';
            break;
        case 'Array':
            val = val[0];
            rule.$rule = val.$rule || '';
            rule.$fn = parseRule( val );
            break;
        case 'Object':
            var subRules = _.omit( val, '$rule', '$fn', '$type');
            if( Object.keys(subRules).length ){
                rule.$type = 'Object';
                rule.$fn = {};
                Object.keys(subRules).forEach(function(k){
                    val = subRules[k];
                    rule.$fn[k] = parseRule( val );
                });
            } else {
                rule.$rule = val.$rule ||'';
                rule.$type = 'function';
                rule.$fn = val.$fn;
            }
            break;
    }
    return rule;
};

exports.parseRule = parseRule;


function Extractor( rules ){
    this.rules = parseRule(rules);
}

Extractor.prototype.extract = function(html){
    var $ = cheerio(html);
    out = getItem($, this.rules );
    return out;
};

var getItem = function( $, rule ){
    if(typeof $ === 'string' )
        $ = cheerio.load($);
    var out;
    var elem = rule.$rule? $.find(rule.$rule) : $;
    switch ( rule.$type ){
        case 'function':
            out = rule.$fn( elem );
            break;
        case 'Object':
            out = {};
            Object.keys(rule.$fn).forEach(function( key){
                var subRule = rule.$fn[key];
                out[key] = getItem( elem, subRule );
            });
            break;
        case 'Array':
            out = [];
            _.each( elem, function(item){
                var data = getItem(cheerio(item), rule.$fn );
                out.push(data);
            });
            break;
    }
    return out;
};


exports.getItem = getItem;

exports.Extractor = Extractor;
