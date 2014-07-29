editor.getContent('<p>test</p>');
jQuery(function($){
    $.ajax({
        url : 'http://127.0.0.1:3000/getWeixin',
        type : 'get',
        dataType : 'jsonp',
        success : function(res){
        	console.log(res);
            if( res.success ) {
            	 var data = res.data,
                     len = data.length,
                     size = 2,
                     index = 0,
                     maxSize = 8;

                for(var i = 0; i < len - size; i++){
                    $('#js_add_appmsg').trigger('click');
                }

                (function(){
                    var arg = arguments;

                    if( index < len && index < maxSize ) {
                    	
                        $('.js_edit').eq( index ).trigger('click');
                        var page = data[index];
                        $('.js_title').val( page.title );
                        $('.js_author').val( page.username );
                        $('iframe[id^="ueditor_"]').contents().find('body').html(page.content);
                        $('.frm_textarea').val( page.content );
                        $('.js_url').val( page.viewSource );

						index++;
						arg.callee();
                    }
                }());
            }
        }
    });
});