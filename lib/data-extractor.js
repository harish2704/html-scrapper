"use strict";

var cheerio = require('cheerio');
var _ = require('underscore');
var fn = require('./fn');

var parseRule = function( val ){
    var rule = {};
    rule.$type = val.constructor.name;
    switch( rule.$type ){
        case 'String':
            rule.$fn = fn.text;
            rule.$rule = val;
            rule.$type = 'function';
            break;
        case 'Array':
            val = val[0];
            rule.$rule = val.$rule || '';
            rule.$fn = parseRule( val );
            delete rule.$fn.$rule;
            break;
        case 'Object':
            var subRules = _.omit( val, '$rule', '$fn', '$type');
            if( Object.keys(subRules).length ){
                rule.$type = 'Object';
                rule.$fn = {};
                rule.$rule = val.$rule || '';
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


var getItem = function( $, rule ){
    if(typeof $ === 'string' ){
      $ = cheerio.load($);
    }
    var out;
    var elem = rule.$rule? $.find(rule.$rule) : $;
    switch ( rule.$type ){
        case 'function':
            out = elem.length? rule.$fn( elem ) : '';
            break;
        case 'Object':
            out = {};
            if(elem.length) {
                Object.keys(rule.$fn).forEach(function( key){
                    var subRule = rule.$fn[key];
                    out[key] = getItem( elem, subRule );
                });
            }
            break;
        case 'Array':
            out = [];
            if(elem.length) {
                _.each( elem, function(item){
                    var data = getItem(cheerio(item), rule.$fn );
                    out.push(data);
                });
            }
            break;
    }
    return out;
};
exports.getItem = getItem;
/**
 * Extractor
 * @class
 * Extract data from HTML pages based on as schema.
 * A schema consists of following.
 * * names of fields to be fetched
 * * CSS rules for each fields
 * * Data extractor function for each fields.
 *
 * @param {Object} schema schema definition. Schema definition can have nested schema at any level.
 * @return {undefined}
 */
function Extractor( schema ){
    this.rules = parseRule( schema );
}

/**
 * extract data from a html string/page
 *
 * @param {String} html HTML page.
 * @return {Object} extracted data as per schema definition.
 */
Extractor.prototype.extract = function(html){
    var $ = cheerio(html);
    var out = getItem($, this.rules );
    return out;
};


exports.Extractor = Extractor;
