// ==UserScript==
// @name        New script - google.com
// @namespace   Violentmonkey Scripts
// @match       https://code.earthengine.google.com/
// @require     https://code.jquery.com/jquery-1.12.4.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @version     0.0.1
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @author      Saibo Li, IGSNRR,email:742187365@qq.com
// @updateURL    https://github.com/Jackli9218/GEE
// @downloadURL  https://github.com/Jackli9218/GEE
// @description 2019/12/17 下午3:33:19
// ==/UserScript==
(function () {
    //与元数据块中的@grant值相对应，功能是生成一个style样式
    GM_addStyle('#down_video_btn{color:black;font-size:11px;line-height:19px}');
    GM_addStyle('.ui-autocomplete{max-height:400px;width:400px;overflow-y:auto;overflow-x:auto}');
    GM_addStyle('ul{background:white}');

    var down_btn_html = '<button  title="Copy" id="down_btn">';
    down_btn_html += '<label for="Copy">Copy: </label>';  
    down_btn_html += ' </button>';
    down_btn_html += '<input id="project">';
 
    //将以上拼接的html代码插入到网页里的ul标签中
    var ul_tag = $("div.editor-panel>div.header>div");
    if (ul_tag) {
        ul_tag.append(down_btn_html);
    }
    var ul_ta = $("div.editor-panel>div.jfkScrollable>div.jfkScrollable-inner>div.zippy + div>div.ace_gutter")
    if(ul_ta){
      ul_ta.attr("id","newId");
    }
  
    $(function () {
       GM_xmlhttpRequest({
       method: "GET",
       // dataType: "json",
       url: "https://raw.githubusercontent.com/Jackli9218/GEE/master/public/GEEAutocomplete.json",
       onload: function(response) {
       var project = response.responseText 
       // var jsonData = JSON.stringify(projects);// 转成JSON格式
       var result = $.parseJSON(project);// 转成JSON对象
       // alert(result[0])
        var projects = [
          {
            label: "By Saibo Li, IGSNRR",
            Details:"https://github.com/Jackli9218/GEE",
            Usage: "GEE_Autocomplete",
            Returns:"Google Earth Engine Autocomplete Command Plan",
            Link:'https://blog.csdn.net/weixin_43123242/article/details/103136453'
          }
        ];
       $.each(result,function(index,element){
              var projectss = [
                    {
                      label: element.label,
                      Details:element.Details,
                      Usage: element.Usage,
                      Returns:element.Returns,
                      Link:element.Link
                    }
                  ];
              projects.push(projectss[0])

             }
         );
    
    $( "#project" ).autocomplete({
      minLength: 0,
      source: projects,
      focus: function( event, ui ) {
        $( "#project" ).val( ui.item.label );
        return false;
      },
      select: function( event, ui ) {
         $( "#project" ).val( ui.item.label );
         var e=document.getElementById("project"); 
         e.select();  
         document.execCommand("Copy"); 
        return false;
      }
    })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
      return $( "<li >" )
        .append( "<div style='font-weight:bold'>" + item.Usage + "</div>" )
        .append("<div><span style='font-weight:bold'>Returns:</span>"+item.Returns+"</div>")
        .append($("<a title='Details' target='_blank'>Details</a>").attr('href',item.Details))
        .append("<br>")
        .append($("<a title='Demo' target='_blank'>Demo</a>").attr('href',item.Link))
        .append("<hr />")
        .appendTo( ul );
    };
        $("#down_btn").click(function () {
         var e=document.getElementById("project"); 
         e.select();  
         document.execCommand("Copy");
        });
      }
       });
      
    });
 
})();
