$(function () {
    $("#sidebar").load("./sidebar.html");
    /*--------------------gaode map-----------------*/
    var map = new AMap.Map("map", {
        resizeEnable: true,
        center: [121.674396,29.803857],
        zoom: 16,
    });
    if (!isSupportCanvas()) {
        alert('热力图仅对支持canvas的浏览器适用,您所使用的浏览器不能使用热力图功能,请换个浏览器试试~')
    }
    //详细的参数,可以查看heatmap.js的文档 http://www.patrick-wied.at/static/heatmapjs/docs.html
    //参数说明如下:
    /* visible 热力图是否显示,默认为true
     * opacity 热力图的透明度,分别对应heatmap.js的minOpacity和maxOpacity
     * radius 势力图的每个点的半径大小
     * gradient  {JSON} 热力图的渐变区间 . gradient如下所示
     *	{
     .2:'rgb(0, 255, 255)',
     .5:'rgb(0, 110, 255)',
     .8:'rgb(100, 0, 255)'
     }
     其中 key 表示插值的位置, 0-1
     value 为颜色值
     */
    var heatmap;
    map.plugin(["AMap.Heatmap"], function() {
        //初始化heatmap对象
        heatmap = new AMap.Heatmap(map, {
            radius: 50, //给定半径
            opacity: [0, 0.8]
            ,gradient:{
                0.5: '#1f4dff',
                0.65: 'rgb(117,211,248)',
                0.7: 'rgb(0, 255, 0)',
                0.85: '#ffea00',
                1.0: 'red'
            }
        });
/*        //设置数据集：该数据为北京部分“公园”数据
        heatmap.setDataSet({
            data: heatmapzoo,
            max: 100
        });*/
    });
    var adminData = [];
    load();
    function load() {
        $.ajax({
            type: "post",
            url: "/load/list",
            async: false,
            datatype: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                var sumData = 0;
                for (var i in data) {
                    sumData += data[i].count;
                }
                $('#sumData').text(sumData);
                heatmap.setDataSet({
                    data : data,
                    max : 100
                });
                function sortNumber(a,b){
                    return b.count - a.count;
                }
                data = data.sort(sortNumber);
                $('#hot').text(data[0].count)
            }
        });
        $.ajax({
            type: "post",
            url: "/staff/load",
            async: false,
            datatype: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                adminData = [];
                var adminSum = data.length;
                $('#adminSum').text(adminSum);
                for (var i in data) {
                    adminData.push({
                        position: [data[i].lng,data[i].lat],
                        infoWinContent : data[i].apName,
                        tel: data[i].tel,
                        markerLabel: data[i].name,
                        id : data[i].name,
                        title: data[i].title
                    })
                }
            }
        });
        $.ajax({
            type: "GET",
            async: false,
            url: 'http://api.k780.com/?app=weather.future&weaid=ningbo&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json&jsoncallback=data',
            dataType: 'jsonp',
            jsonp: 'callback',
            jsonpCallback: 'data',
            success: function (data) {
                console.log(data);
                $('#temperature').text(data.result[0].temperature);
                $('#weather').text(data.result[0].weather);
                var weatid = data.result[0].weatid;
                switch (weatid) {
                    case '1':
                        $('#weaimg').removeClass();
                        $('#weaimg').addClass('ion ion-ios-sunny');
                        break;
                    case '2':
                        $('#weaimg').removeClass();
                        $('#weaimg').addClass('ion ion-ios-partlysunny');
                        break;
                    case '3':
                        $('#weaimg').removeClass();
                        $('#weaimg').addClass('ion ion-ios-cloudy');
                        break;
                    case '4':
                    case '5':
                    case '6':
                    case '8':
                    case '9':
                    case '10':
                    case '11':
                    case '12':
                    case '13':
                    case '20':
                    case '22':
                    case '23':
                    case '24':
                    case '25':
                    case '26':
                        $('#weaimg').removeClass();
                        $('#weaimg').addClass('ion ion-ios-rainy');
                        break;
                    case '7':
                    case '14':
                    case '15':
                    case '16':
                    case '17':
                    case '18':
                    case '27':
                    case '28':
                    case '29':
                        $('#weaimg').removeClass();
                        $('#weaimg').addClass('ion ion-ios-snowy');
                        break;
                    default:
                        $('#weaimg').removeClass();
                        $('#weaimg').addClass('ion ion-ios-cloudy');
                }
            }
        });
    }
    setInterval(load,60000);
    //判断浏览区是否支持canvas
    function isSupportCanvas() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }
    /*------------------------数据渲染-----------------------------------*/
    AMapUI.loadUI(['misc/MarkerList'], function(MarkerList) {
        var markerList = new MarkerList({
            //关联的map对象
            map: map,

            //列表的dom容器的id
            listContainer: 'my-list',

            //选中状态（通过点击列表或者marker）时在Marker和列表节点上添加的class，可以借此编写css控制选中时的展示效果
            selectedClassNames: 'selected',

            //返回数据项的Id
            getDataId: function(dataItem, index) {
                //index表示该数据项在数组中的索引位置，从0开始，如果确实没有id，可以返回index代替
                return dataItem.id;
            },
            //返回数据项的位置信息，需要是AMap.LngLat实例，或者是经纬度数组，比如[116.789806, 39.904989]
            getPosition: function(dataItem) {
                return dataItem.position;
            },
            //返回数据项对应的Marker
            getMarker: function(dataItem, context, recycledMarker) {

                //marker的标注内容
                var content = dataItem.markerLabel;

                var label = {
                    offset: new AMap.Pixel(16, 18), //修改label相对于marker的位置
                    content: content
                };

                //存在可回收利用的marker
                if (recycledMarker) {
                    //直接更新内容返回
                    recycledMarker.setLabel(label);
                    return recycledMarker;
                }

                //返回一个新的Marker
                return new AMap.Marker({
                    label: label
                });
            },
            //返回数据项对应的infoWindow
            getInfoWindow: function(dataItem, context, recycledInfoWindow) {

                var tpl = '<p><%- dataItem.title %>-<%- dataItem.id %>：<%- dataItem.infoWinContent %><p>';

                //MarkerList.utils.template支持underscore语法的模板
                var content = MarkerList.utils.template(tpl, {
                    dataItem: dataItem,
                    dataIndex: context.index
                });

                if (recycledInfoWindow) {
                    //存在可回收利用的infoWindow, 直接更新内容返回
                    recycledInfoWindow.setContent(content);
                    return recycledInfoWindow;
                }

                //返回一个新的InfoWindow
                return new AMap.InfoWindow({
                    offset: new AMap.Pixel(0, -23),
                    content: content
                });
            },
            //返回数据项对应的列表节点
            getListElement: function(data, context, recycledListElement) {

                /*  var tpl = '<p><%- dataItem.id %>：<%- dataItem.listDesc %><p>';

                  var content = MarkerList.utils.template(tpl, {
                      dataItem: dataItem,
                      dataIndex: context.index
                  });*/
                var label = '' + (context.index + 1);

                //使用模板创建
                var innerHTML = MarkerList.utils.template(
                    '<% if(data.photos && data.photos[0]) { %>' +
                    '<div class="poi-imgbox">' +
                    '    <span class="poi-img" style="background-image:url(<%- data.photos[0].url %>)"></span>' +
                    '</div>' +
                    '<% } %>' +
                    '<div class="poi-info-left">' +
                    '    <h3 class="poi-title">' +
                    '        <%- label %>. <%- data.markerLabel %>' +
                    '    </h3>' +
                    '    <div class="poi-info">' +
                    '        <p class="poi-addr">巡逻地点：<%- data.infoWinContent %></p>' +
                    '<% if(data.tel ){ %>' +
                    '        <p class="poi-addr">电话：<%- data.tel %></p>' +
                    '<% } %>' +
                    '    </div>' +
                    '</div>' +
                    '<div class="clear"></div>', {
                        data: data,
                        label: label
                    });

                if (recycledListElement) {
                    //存在可回收利用的listElement, 直接更新内容返回
                    recycledListElement.innerHTML = innerHTML;
                    return recycledListElement;
                }

                //返回一段html，MarkerList将利用此html构建一个新的dom节点
                return '<li>' + innerHTML + '</li>';
            }

        });

        //监听选中改变
        markerList.on('selectedChanged', function(event, info) {
            //console.log(event, info);
        });

        //监听Marker和ListElement上的点击
        markerList.on('markerClick listElementClick', function(event, record) {
            //console.log(event, record);
        });

        //展示该数据
        markerList.render(adminData);

        map.setZoomAndCenter(16, [121.674396,29.803857]);
    });



});