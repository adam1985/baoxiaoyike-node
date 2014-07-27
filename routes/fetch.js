
/*
 * GET fetch listing.
 */

var cheerio = require('cheerio');
var nodegrass = require('nodegrass');
var dateFormat = require('../dateFormat');
var http = require("http");
var fs = require('fs');
var spawn = require('child_process').spawn;

exports.fetchresult = function(req, res){



	dateFormat.format();
	var initTime = new Date();
	var dateString = initTime.format("yyyyMMddhhmmss"), dirPath = './create/' + dateString;
	fs.mkdirSync(dirPath, {mode : 'r+'});
	//spawn('mkdir', [dirPath]);


  var urls = req.body.urls, pageLinks = [];
  if( urls ){
	pageLinks = JSON.parse( urls ), pageIndex = 0, length = pageLinks.length,
	totalPage = [];
	(function(){
		var args = arguments;
		if( pageIndex < length ){
			var targetLink = pageLinks[pageIndex];
			
			nodegrass.get(targetLink, function (data) {
				var $ = cheerio.load(data);
				var singlePage = {}, 
					title = $('title').text();
				singlePage.title = title;
				singlePage.pages = [];
				var iframe = $('iframe');
				iframe.each(function(i){
					var $this = $(this), 
					imgRex = /player\.html\?vid=(\w+)&/, 
					innerPage = {} ,
					pageUrl = $this.attr('src');
					if( imgRex.test(pageUrl) ){
						innerPage.imgSrc = 'http://shp.qpic.cn/qqvideo_ori/0/' + RegExp.$1 + '_496_280/0';
						innerPage.pageUrl = pageUrl;
						
					}
					singlePage.pages.push(innerPage);
					
					//console.log(innerPage);
					
				});
				
				totalPage.push(singlePage);
				
				pageIndex++;
				args.callee();
			}, 'utf8').on('error', function(e) {
                args.callee();
            });
		} else {

			var stepIndex1 = 0;
			
			(function(){
				var arg1 = arguments;
				
				if( stepIndex1 < totalPage.length ) {
					var outerPage = totalPage[stepIndex1], stepIndex2 = 0;

					(function(){
						
						var arg2 = arguments;
						
						if( stepIndex2 < outerPage.pages.length ) {
						
							var innerPage = outerPage.pages[stepIndex2];
							http.get(innerPage.imgSrc, function(res){
								var imgData = "";

								res.setEncoding("binary"); 


								res.on("data", function(chunk){
									imgData+=chunk;
								});

								res.on("end", function(){
									fs.writeFile(dirPath + '/' + stepIndex1 + '' + stepIndex2 + '.jpg', imgData, "binary", function(err){
										if(err){
											console.log("down fail");
										}
										console.log("down success");
										stepIndex2++;
										arg2.callee();
									});
								});
								
								res.on("error", function(){
									stepIndex2++;
									arg2.callee();
								});
							});
						} else {
							stepIndex1++;
							arg1.callee();
						}
					}());
				} else {
					res.set({'Content-Type':'text/plain'});
					res.send(JSON.stringify(totalPage));
				}
			}());
			
			//res.set({'Content-Type':'text/plain'});
			//res.send(JSON.stringify(totalPage));


		}
		
	}());
	
  }
  
};