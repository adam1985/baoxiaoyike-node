
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
			var imgPath = 'http://adam1985.github.io/bxyk/assets/images/logo.jpg';
			v.pages.forEach(function(vv, ii){
				if( vv.imgSrc ) {
					imgPath = vv.imgSrc;
				}
			});
			postSource[i]['content'] = ejs.render(contentTemplate, {
                list : v.pages,
				picSrc : imgPath
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