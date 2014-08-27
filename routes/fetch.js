
/*
 * GET fetch listing.
 */

var cheerio = require('cheerio');
var nodegrass = require('nodegrass');
var dateFormat = require('../module/dateFormat');
var http = require("http");
var fs = require('fs');
var spawn = require('child_process').spawn;

var trim = function(str) {
    return str.replace(/^\s+|\s+$/g, '');
};

var randomName = function( nameList , size) {
    var index = 0, res = [];
    nameList = nameList.concat();
    (function(){
        if( index < size ) {
            var len = nameList.length, random = Math.floor(Math.random() * len);
            res.push( trim(nameList.splice( random, 1)[0]) );
            index++;
            arguments.callee();
        }
    }());

    return res;
};

 //这一段是腾讯视频给的把url转成vid
    function getVidFromUrl(url) {
      url = url || window.location.toString();
      //先从url中分析出vid参数，例如×××××.html?vid=××××××
      var vid = getUrlParam("vid", url),
        r;
      if (!vid) { // 使用新规则生成的专辑单视频页面
        if (r = url.match(/\/\w{15}\/(\w+)\.html/)) {
          vid = r[1];
        }
      }
      // 单视频播放页
      if (!vid) {
        if (r = url.match(/\/page\/\w{1}\/\w{1}\/\w{1}\/(\w+)\.html/)) {
          vid = r[1];
        } else if (r = url.match(/\/(page|play)\/+(\w{11})\.html/)) {
          vid = r[2];
        }
      }
      // 播客专辑播放页
      if (!vid) {
        if (r = url.match(/\/boke\/gplay\/\w+_\w+_(\w+)\.html/)) {
          vid = r[1];
        }
      }
      return encodeURIComponent(vid);
    }
    function getUrlParam(p, u) {
      var u = u || document.location.toString();
      var pa = p + "=";
      var f = u.indexOf(pa);
      if (f != -1) {
        var f2 = u.indexOf("&", f);
        var f2p = u.indexOf("?", f);
        if (f2p != -1 && (f2 == -1 || f2 > f2p))
          f2 = f2p;
        f2p = u.indexOf("#", f);
        if (f2p != -1 && (f2 == -1 || f2 > f2p))
          f2 = f2p;
        if (f2 == -1)
          return u.substring(f + pa.length);
        else
          return u.substring(f + pa.length, f2);
      }
      return "";
    }

    //关于腾讯视频 有问题请找popotang
    function getUrlVid( link, callback){
      var vid = "", r, flashvars = "", return_url;
      //with vid in url query str
      if( r = link.match( new RegExp("(^|&|\\\\?)vid=([^&]*)(&|$|#)") )) {
        vid = encodeURIComponent(r[2]);
        callback( vid );
      }
      //with cid in url
      //如果有连续剧的视频。需要jsonp去腾讯视频后台用cid换取一段json，然后取连续剧的第一集开始播放
      else if( r = link.match( new RegExp("(http://)?v\\.qq\\.com/cover[^/]*/\\w+/([^/]*)\\.html") ) )
      {
        var cid = encodeURIComponent(r[2]), 
		path = 'http://sns.video.qq.com/fcgi-bin/dlib/dataout_ex?auto_id=137&cid=' + cid + '&otype=json'; 
		
		nodegrass.get(path, 
			function ( data ) {
				data = data.toString();
				eval(data);
				try{
					vid = QZOutputJson['videos'][0]['vid'];
				}catch(e){
				}
				callback( vid );
				
		}, 'utf8')

      }
      //with vid in url
      //这里用腾讯视频给的逻辑来做
      else{
        vid = getVidFromUrl(link);
        callback( vid );

      }
    }
	
	var trim = function(str) {
        return str.replace(/^\s+|\s+$/gm, '');
    };


exports.fetchresult = function(req, res){

	dateFormat.format();
	var initTime = new Date();
	var dateString = initTime.format("yyyyMMddhhmmss"),
        dirPath = './create/' + dateString,
        logerDir = './loger',
        listPath = dirPath + '/list.txt',
        pageJson = logerDir + '/pageJson.txt',
        resultPath = logerDir + '/result.txt',
        usernamePath = './model/username.txt';
	fs.mkdirSync(dirPath, {mode : 'r+'});
	//spawn('mkdir', [dirPath]);

    var createpageMessage = function( data ) {
        fs.writeFileSync(listPath, '');
        if( data.length ){
            data.forEach(function(v){
                fs.appendFileSync(listPath, v.sourcePage + '\r\n');
                fs.appendFileSync(listPath, v.title + '\r\n');
                fs.appendFileSync(listPath, v.username + '\r\n');
                fs.appendFileSync(listPath, v.viewSource + '\r\n');
                if(v.pages.length){
                    v.pages.forEach(function(page){
                        
						if(page.imgSrc){
							fs.appendFileSync(listPath, page.imgSrc + '\r\n');
						}
						
						if(page.pageUrl){
							fs.appendFileSync(listPath, page.pageUrl + '\r\n');
						}
                        
                        fs.appendFileSync(listPath, '\r\n');
                    });
                }
                fs.appendFileSync(listPath, '\r\n\r\n');
            });
        }
    };


    var successMessage = function( data ){
        var list = [];
        if( data.length ){
            data.forEach(function(v){
                list.push({
                    title : v.title,
                    sourcePage : v.sourcePage
                });
            });
        }
        return list;
    };

  var usernames = fs.readFileSync(usernamePath).toString().split(/\s+/);

  var urls = req.body.urls, pageLinks = [];
  if( urls ){
	pageLinks = JSON.parse( urls );
  var pageIndex = 0, length = pageLinks.length,
	totalPage = [];
    var userList = randomName(usernames, length);
	(function(){
		var args = arguments;
		if( pageIndex < length ){
			var targetLink = trim(pageLinks[pageIndex]),
                //targetUser = userList[pageIndex],
				targetUser = '點右边关註»',
				isWeixin = /mp\.weixin\.qq\.com/.test(targetLink);
				
				
				var singlePage = {};
				
				singlePage.sourcePage = targetLink;
                singlePage.viewSource = 'http://m.baoxiaoyike.cn';
                singlePage.username = targetUser;
				
			if( isWeixin ) {
				nodegrass.get(targetLink, function (data) {
					var $ = cheerio.load(data),
						title = $('title').text();
					
					singlePage.title = title;
					singlePage.pages = [];
					
					var imgRex = /var\s+msg_cdn_url\s+=\s+"(.*)";/gm,
						innerPage = {}, 
						content = $('body').html();
					if( imgRex.test(content) ){
						innerPage.imgSrc = RegExp.$1;
						singlePage.pages.push(innerPage);
					}
					
					var iframe = $('iframe');
					iframe.each(function(i){
						var $this = $(this), 
						imgRex = /player\.html\?vid=(\w+)&/, 
						pageUrlRex = /http:\/\/v\.qq\.com\/iframe\/player.html\?vid=\w+/,
						innerPage = {} ,
						pageUrl = $this.attr('src');
						if( imgRex.test(pageUrl) ){
							innerPage.imgSrc = 'http://shp.qpic.cn/qqvideo_ori/0/' + RegExp.$1 + '_496_280/0';
							innerPage.pageUrl = pageUrl.match(pageUrlRex)[0];
						}
						singlePage.pages.push(innerPage);
					});

					
					totalPage.push(singlePage);
					
					pageIndex++;
					args.callee();
				}, 'utf8').on('error', function(e) {
					args.callee();
				});
			} else {
				var vidRex;
				if( /vid=/.test(targetLink) ){
					vidRex = /(?:vid=)(\w{11}?)/;
				} else {
					vidRex = /(\w{11}?)(?:\.html)/;
				}
				
				singlePage.pages = [];
				

				
				var innerPage = {}, vid = '';
				
				
				
				baoxiaoyike = function(data){
					singlePage.title = data.vl.vi[0].ti;
					innerPage.imgSrc = 'http://shp.qpic.cn/qqvideo_ori/0/' + vid + '_496_280/0';
					innerPage.pageUrl = 'http://v.qq.com/iframe/player.html?vid=' + vid;
					singlePage.pages.push({},innerPage);
					totalPage.push(singlePage);
					pageIndex++;
					args.callee();
				}

				/*if( vidRex.test(targetLink) ){
					var vid = vidRex.exec(targetLink)[1];
					nodegrass.get('http://vv.video.qq.com/getinfo?vids='+ vid + '&otype=json&callback=baoxiaoyike', 
					function ( data ) {
						data = data.toString();
						eval(data);
						
					}, 'utf8').on('error', function(e) {
						args.callee();
					});

				}*/

				
				getUrlVid(targetLink, function($vid){
					vid = $vid;
					nodegrass.get('http://vv.video.qq.com/getinfo?vids='+ vid + '&otype=json&callback=baoxiaoyike', 
					function ( data ) {
						data = data.toString();
						eval(data);
						
					}, 'utf8').on('error', function(e) {
						args.callee();
					});
				});
			}
			
			
		} else {

			var stepIndex1 = 0;
			
			(function(){
				var arg1 = arguments;
				
				if( stepIndex1 < totalPage.length ) {
					var outerPage = totalPage[stepIndex1], stepIndex2 = 0;

					(function(){
						
						var arg2 = arguments;
						
						if( stepIndex2 < outerPage.pages.length ) {
						
							var innerPage = outerPage.pages[stepIndex2], imgSrc = innerPage.imgSrc;
							if( imgSrc ) {
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
								stepIndex2++;
								arg2.callee();
							}
							
						} else {
							stepIndex1++;
							arg1.callee();
						}
					}());
				} else {

                    fs.writeFileSync(pageJson, JSON.stringify(totalPage) );
                    fs.writeFileSync(resultPath, JSON.stringify(successMessage( totalPage )) );
                    createpageMessage(totalPage);

					res.set({'Content-Type':'text/plain'});
					res.send(JSON.stringify({
                        success : true,
                        data : successMessage( totalPage )
                    }));
				}
			}());

		}
		
	}());
	
  }
  
};