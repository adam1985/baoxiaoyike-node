
/*
 * GET home page.
 */
var fs = require('fs'),
    ejs = require('ejs');

module.exports = function(req, res){
    var rootPath = process.cwd();
    var contentTemplate = fs.readFileSync( rootPath + '/views/content.ejs', 'utf8').toString(),
        postSource = JSON.parse(fs.readFileSync( rootPath + '/loger/pageJson.txt', 'utf8').toString());

    if( postSource.length ){
        postSource.forEach(function(v, i){
            postSource[i]['content'] = ejs.render(contentTemplate, {
                list : v.pages
            });
        });
    }

    var callback = req.query.callback || '';
    res.set({'Content-Type':'text/plain'});
    res.send(callback + '(' + JSON.stringify({
        success : true,
        data : postSource
    }) + ');');
};