
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: '微信公众平台数据采集' });
};