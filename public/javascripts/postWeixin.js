if( isPost === undefined ){
    var isPost = true;
}

jQuery(function($){
    $.ajax({
        url : 'http://127.0.0.1:3000/getWeixin',
        type : 'get',
        dataType : 'jsonp',
        success : function(res){

            if( res.success ) {
            	 var data = res.data,
                     len = data.length,
                     size = 2,
                     index = 0,
                     maxSize = 8;

				if( isPost ) {
					for(var i = 0; i < len - size; i++){
						$('#js_add_appmsg').trigger('click');
					}
				}


                (function(){
                    var arg = arguments;

                    if( index < len && index < maxSize ) {
						$('.js_edit').eq( index ).trigger('click');
						var page = data[index],
							ueditBody = $('iframe[id^="ueditor_"]').contents().find('body'),
							frm_textarea = $('.frm_textarea');
                    	if( isPost ) {
							var jsTitle = $('.js_title');
							jsTitle.val( page.title );
							jsTitle.trigger('change');
							$('.js_author').val( page.username );
							ueditBody.html(page.content);
							frm_textarea.val( page.content );
							$('.js_url').val( page.viewSource );
							$('.frm_checkbox').attr('checked', false);
							$('.js_show_cover_pic').removeClass('selected');
						} else {
							var tipText = '<span style="max-width: 100%; color: rgb(127, 127, 127); font-size: 14px; box-sizing: border-box ! important; word-wrap: break-word ! important;">这里每天都有分享各种搞笑视频、叽歪笑话、爆笑段子、奇闻异事，敬请期待。由于内容过于搞笑，全国发生多起笑得肚子疼案例！保证让你笑的合不拢嘴！</span>', imgPath;
							$.each(page.pages,function(i, v){
								if( v.imgSrc ) {
									imgPath = v.imgSrc;
									return false;
								}
							});
							
							if( imgPath ) {
								tipText += '<img src="' + imgPath + '" />';
							}
							
							var shareHtml = '<fieldset style="white-space: normal; border: 1px solid rgb(204, 204, 204); padding: 5px; margin: 0px; max-width: 100%; color: rgb(62, 62, 62); word-wrap: break-word !important; background-color: rgb(248, 247, 245);white-space: normal; border: 1px solid rgb(204, 204, 204); padding: 5px; margin: 0px; max-width: 100%; color: rgb(62, 62, 62); word-wrap: break-word !important; background-color: rgb(248, 247, 245);height:0;text-indent:-9999em;overflow:hidden;"><legend style="padding: 0px; line-height: 24px; margin: 0px; max-width: 100%; box-sizing: border-box !important; word-wrap: break-word !important;"><span style="font-family: arial, helvetica, sans-serif; max-width: 100%; font-size: 14px; box-sizing: border-box !important; word-wrap: break-word !important;"><strong style="max-width: 100%; color: rgb(102, 102, 102); font-size: 12px; box-sizing: border-box !important; word-wrap: break-word !important;"><span style="padding: 4px 10px; max-width: 100%; color: rgb(255, 255, 255); margin-right: 8px; border-top-left-radius: 5px; border-top-right-radius: 5px; border-bottom-right-radius: 5px; border-bottom-left-radius: 5px; box-sizing: border-box !important; word-wrap: break-word !important; background-color: rgb(1, 165, 191);"></span></strong><span style="max-width: 100%; color: rgb(192, 0, 0); font-size: 12px; box-sizing: border-box !important; word-wrap: break-word !important;"><strong style="max-width: 100%; box-sizing: border-box !important; word-wrap: break-word !important;"></strong></span></span></legend><p style="margin-top: 0px; margin-bottom: 0px; min-height: 1em; max-width: 100%; word-wrap: normal; box-sizing: border-box !important;">' + tipText + '</p></fieldset>';
							
							
							
							var pageContent = ueditBody.html();
							pageContent = pageContent.replace(/<p([\w\W]*?)<\/p>/, shareHtml);
							ueditBody.html(pageContent);
							frm_textarea.val( pageContent );
						}

						index++;
						arg.callee();
                    } else {
						isPost = true;
					}
                }());
            }
        }
    });
});