var ModisLc = ee.ImageCollection("MODIS/006/MCD12Q1"),
    geometry = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[109.6591796875, 37.430410309924575],
          [109.6591796875, 31.549551014402827],
          [118.6240234375, 31.549551014402827],
          [118.6240234375, 37.430410309924575]]], null, false);
var IGBPLc = ModisLc.select('LC_Type1');
// Force projection of 500 meters/pixel, which is the native MODIS resolution.
var SCALE = 500;
//裁剪数据 
var LC = IGBPLc.map(function(img){
  img = img.reproject('EPSG:4326', null, SCALE)
  return img.clip(geometry);
})

//===========================展示数据start===========================
var date_begin = '2001-01-01', // begin time
    date_end   = '2018-12-31';
var LCTime = LC.filterDate(date_begin,date_end);
// 创建裂图例面板
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});
// Create and add the legend title.
var legendTitle = ui.Label({
  value: 'MODIS Land Cover for IGBP Classification System',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});
legend.add(legendTitle);

var loading = ui.Label('Loading legend...', {margin: '2px 0 4px 0'});
legend.add(loading);

// Creates and styles 1 row of the legend.
var makeRow = function(color, name) {
  // Create the label that is actually the colored box.
  var colorBox = ui.Label({
    style: {
      backgroundColor: '#' + color,
      // Use padding to give the box height and width.
      padding: '8px',
      margin: '0 0 4px 0'
    }
  });

  // Create the label filled with the description text.
  var description = ui.Label({
    value: name,
    style: {margin: '0 0 4px 6px'}
  });

  return ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
};

// Get the list of palette colors and class names from the image.
var palette=[
    '05450a', '086a10', '54a708', '78d203', '009900', 'c6b044', 'dcd159',
    'dade48', 'fbff13', 'b6ff05', '27ff87', 'c24f44', 'a5a5a5', 'ff6d4c',
    '69fff8', 'f9ffa4', '1c0dff'
  ];
var names = [
    'Evergreen Needleleaf Forests', 'Evergreen Broadleaf Forests', 
    'Deciduous Needleleaf Forests', 'Deciduous Broadleaf Forests', 
    'Mixed Forests', 'Closed Shrublands', 'Open Shrublands',
    'Woody Savannas', 'Savannas', 'Grasslands', 'Permanent Wetlands', 
    'Croplands', 'Urban and Built-up Lands', 'Cropland/Natural Vegetation Mosaics',
    'Permanent Snow and Ice', 'Barren', 'Water Bodies'
];
var igbpLandCoverVis = {
  min: 1.0,
  max: 17.0,
  palette: palette,
};

Map.setCenter(109, 29,  6);
loading.style().set('shown', false);
for (var i = 0; i < names.length; i++) {
    legend.add(makeRow(palette[i], names[i]));
  }
  
var list = LCTime.toList(1000);
var n = list.size().getInfo();
for (var i=0; i<n; i++){
  var image = ee.Image(list.get(i));
  var nameOut = ee.String(image.get('system:index')).getInfo()
  Map.addLayer(image, igbpLandCoverVis, nameOut);
}
// Add the legend to the map.
Map.add(legend);
//===========================展示数据end===========================
//下载数据  
var list = LC.toList(1000);
var n = list.size().getInfo();
for (var i=0; i<n; i++){
  var image = ee.Image(list.get(i));
  var nameOut = ee.String(image.get('system:index')).getInfo()
  Export.image.toDrive({
    image: image, // 要下载的影像
    description: nameOut, // 下载任务描述，也是文件的默认名称
    folder: 'IGBPLandcover', // 选择要下载到云盘的哪个文件夹
    scale: 500, // 分辨率，默认值是500m
    maxPixels: 1e10 // 下载数据的最大像元数
  });
}
