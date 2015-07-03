"use strict";



/**
 * Collection of useful extraction functions 
 * @mixin Fn
 * @example
 *
 * var Fn = require('html-scrapper').Fn;
 *
 * var schema = {
 *  items: [{
 *    $rule: 'ul#items li'
 *    name:{
 *      $rule: 'a.title',
 *      $fn: Fn.text
 *    },
 *    price:{
 *      $rule: 'b.price',
 *      $fn: Fn.asInt
 *    },
 *  }],
 * };
 *
 */
var Fn = {};


/**
 * get text content
 */
Fn.text = function(e){
    var txt = e.text();
    return txt ? txt.trim(): txt ;
};

/**
 * get value of 'src' attribute
 */
Fn.src = function(e){
    return e.attr().src;
};

/**
 * get value of 'href' attribute
 */
Fn.link = function(e){
    return e.attr().href;
};

/**
 * get value of JQuery(elem).data().
 */
Fn.data = function(e){
    return e.data();
};

/**
 * get value of 'class' attribute
 */
Fn.classes = function(e){
    return e.attr()['class'];
};


/**
 * get text content and cast it into integer using parseInt. All coma are deleted in the string.
 * Useful for parsing Pricing texts
 */
Fn.asInt = function(e){
    var text = e.text();
    text = text.replace(',', '');
    return parseInt(text, 10);
};

/**
 * get text content and cast it into Float using parseFloat. All coma are deleted in the string.
 */
Fn.asFloat = function(e){
    var text = e.text();
    text = text.replace(',', '');
    return parseFloat(text);
}


module.exports = Fn;


