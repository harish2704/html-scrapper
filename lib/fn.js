exports.text = function(e){
    var txt = e.text();
    return txt ? txt.trim(): txt ;
};

exports.src = function(e){
    return e.attr().src;
};

exports.link = function(e){
    return e.attr().href;
};

exports.data = function(e){
    return e.data();
};

exports.classes = function(e){
    return e.attr()['class'];
};

exports.asInt = function(e){
    var text = e.text();
    text = text.replace(',', '');
    return parseInt(text);
};

exports.asFloat = function(e){
    var text = e.text();
    text = text.replace(',', '');
    return parseFloat(text);
}

