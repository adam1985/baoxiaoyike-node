
/*
 * GET home page.
 */
var fs = require('fs');

module.exports = function(req, res){
    var data = {
        title: '微信公众平台多图集发布测试'
    };

    res.render('postWeixin', data);
};