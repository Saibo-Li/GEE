
/**
 * Using landsat8 data, extract indexes and study certain geographical phenomena
 * And because of the lack of necessary data, the script cannot run successfully directly
 * 
 * Saibo Li
 * Update 20191119
 * 
 * ------------------------------
 * 1、It is recommended to refer to the algorithm in the script. 
 * The data in the script is test data. 
 * It is recommended not to use the direct running results for other purposes.
 * 
 * 2、Lack of relevant data(trainpoint* and so on)
 */
Map.setOptions("SATELLITE");
Map.centerObject(geometry,5)
Map.addLayer(geometry, {color: "black",optional:1},'geometry');
 
//Landsat8 SR数据去云
function rmCloud(image) {
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  var qa = image.select("pixel_qa");
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}

//缩放
function scaleImage(image) {
  var time_start = image.get("system:time_start");
  image = image.multiply(0.0001);
  image = image.set("system:time_start", time_start);
  return image;
}

//NDVI
function NDVI(image) {
  return image.addBands(
    image.normalizedDifference(["B5", "B4"])
         .rename("NDVI"));
}
var l8Col = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR")
              .filterBounds(geometry)
              .filterDate("2015-02-01", "2015-9-30")
              .filter(ee.Filter.lte("CLOUD_COVER", 50))
              .map(rmCloud)
              .map(scaleImage)
              .map(NDVI);
              
l8Col = l8Col.qualityMosaic("NDVI").clip(geometry)

/**
calculate index value
*/                   
//start===================================================================================================
//DEM
var dem = ee.Algorithms.Terrain(srtm);
var elevation = dem.select("elevation");
var slope = dem.select("slope");
var aspect = dem.select("aspect");

// NDWI
var NDWI = l8Col.normalizedDifference(["B3", "B5"])
                      .rename("NDWI");

//FVC
/**
calcute FCV, based on 5% confidence interval of ndvi histogram,and expression
((NDVI-NDVIsoil)/(NDVIveg-NDVIsoil))
from : https://max.book118.com/html/2017/0602/111188929.shtm
*/
//draw ndvi histogram
// var chart = ui.Chart.image.histogram({
//                 image: l8Col.select("NDVI"), 
//                 region: geometry, 
//                 scale: 1000
//               })
//               .setOptions({
//                 title: "NDVI Histogram",
//                 hAxis: {title: "ndvi"},
//                 vAxis: {title: "count"}
//               });
// print(chart);
var FVC = l8Col.expression(
  '(NDVI-0.078)/0.922',
  {
    NDVI:l8Col.select('NDVI')
  }).rename('FVC')

// //MSAVI
// /**
// expression:MSAVI=(2*NIR+1-((2*NIR+1)^2-8*(NIR-RED))^1/2)/2
// */
var MSAVI = l8Col.expression(
  '(2*NIR+1-sqrt((2*NIR+1)*(2*NIR+1)-8*(NIR-RED)))/2',
  {
    RED:l8Col.select('B4'),
    NIR:l8Col.select('B5')
  }).rename('MSAVI');

// //Albedo
// /**
// expression:Albedo=0.356*Blue+0.13*Red+0.373*NIR+0.085*SWIR1+0.072*SWIR2-0.0018
// */
var Albedo = l8Col.expression(
  '0.356*Blue+0.13*Red+0.373*NIR+0.085*SWIR1+0.072*SWIR2-0.0018',
  {
    Blue:l8Col.select('B2'),
    Red:l8Col.select('B4'),
    NIR:l8Col.select('B5'),
    SWIR1:l8Col.select('B6'),
    SWIR2:l8Col.select('B7')
  }).rename('Albedo');
  
// //BSI
// /**
// expression:BSI=(100 * ((SWIR + Red) - (NIR + Blue))/((SWIR + Red) + (NIR + Blue))) + 100
// */
var BSI = l8Col.expression(
  '(100 * ((SWIR + Red) - (NIR + Blue))/((SWIR + Red) + (NIR + Blue))) + 100',
  {
    Blue:l8Col.select('B2'),
    Red:l8Col.select('B4'),
    NIR:l8Col.select('B5'),
    SWIR:l8Col.select('B6'),
  }).rename('BSI');
  
// //TGSI
// /**
// expression:TGSI = (Red-Blue)/(Red+Blue+Green)
// */
var TGSI = l8Col.expression(
  '(Red-Blue)/(Red+Blue+Green)',
  {
    Blue:l8Col.select('B1'),
    Green:l8Col.select('B2'),
    Red:l8Col.select('B3'),
  }).rename('TGSI');

// //cloud or snow
// /**extract cloud layer*/
// var CloudMask = FVC.lt(0).or(l8Col.select("NDVI").lte(0.23)).and(BSI.lt(95));
// var CloudMask = l8Col.select("NDVI").lte(0.23).and(NDWI.lt(0.1).and(BSI.lt(97)));
// (NDWI.lt(0.1).and(BSI.lt(97)))
var CloudMask = l8Col.select("NDVI").lte(0.21).and(NDWI.lt(0.1).and(BSI.lt(97))).add(Albedo.gt(0.4));

//urban
/**
extract urban
*/
ESA2015urban = ESA2015urban.unmask(0).clip(geometry).lt(6)

var dataset = ee.ImageCollection('MODIS/006/MOD11A2')
                  .filter(ee.Filter.date('2015-01-01', '2015-12-31'));
var LST = dataset.select('LST_Day_1km')
                .reduce(ee.Reducer.mean())
                .clip(geometry);
//end=====================================================================================================

// var bands = [
//   'B5', 'B4', 'B3',"NDVI","SLOPE", "ELEVATION","ASPECT","NDWI",
//   "FVC","MSAVI","Albedo","BSI","TGSI","LST"
// ];

var bands = [
  "NDVI","SLOPE", "ELEVATION","ASPECT","NDWI",
  "FVC","MSAVI","Albedo","BSI","TGSI","LST"
];

var l8ColCart = l8Col.addBands(elevation.rename("ELEVATION"))
                        .addBands(slope.rename("SLOPE"))
                        .addBands(aspect.rename("ASPECT"))
                        .addBands(NDWI.rename("NDWI"))
                        .addBands(FVC.rename("FVC"))
                        .addBands(MSAVI.rename("MSAVI"))
                        .addBands(Albedo.rename("Albedo"))
                        .addBands(BSI.rename("BSI"))
                        .addBands(TGSI.rename('TGSI'))
                        .addBands(LST.rename("LST"))
                        .select(bands)
                        .clip(geometry)
var l8ColCart = l8ColCart.updateMask(NDWI.lt(0))
                                 .updateMask(CloudMask.not())

/**
Print train point message
*/
//start===================================================================================================
// Layer process about Point
var bands = [
  "NDVI","SLOPE", "ELEVATION","NDWI",
  "FVC","MSAVI","Albedo","BSI","sandPer"
];
var sandPer = sandPer.clip(geometry).select('b0');

var PointMesLay = l8ColCart.addBands(sandPer.rename("sandPer")).select(bands);
// extract partial point
var bandsCSV = [
  "longitude","latitude","NDVI","SLOPE", "ELEVATION","NDWI",
  "FVC","MSAVI","Albedo","BSI","sandPer"
];
// var totalGeo = trainpoint120.geometry().coordinates();
var totalGeo = point.coordinates();
var trainGeoPoi = ee.Geometry.MultiPoint(totalGeo.slice(20,40))
Map.addLayer(trainGeoPoi,{},"trainGeoPoi")
// print(trainGeoPoi)
//getRegion
var pDataList = ee.ImageCollection(PointMesLay).getRegion(trainGeoPoi, 30);
print("pDataList",pDataList)
pDataList.evaluate(function(datas) {
  print("datas is", datas);
  var dateList = [];
  var indexList = [];
  for (var i=1; i<datas.length; i++) {
    dateList.push(ee.Number(i));
    indexList.push([ee.Number(datas[i][1]),ee.Number(datas[i][2]),ee.Number(datas[i][4]), ee.Number(datas[i][5]), ee.Number(datas[i][6]),
    ee.Number(datas[i][7]), ee.Number(datas[i][8]), ee.Number(datas[i][9]),
    ee.Number(datas[i][10]), ee.Number(datas[i][11]), ee.Number(datas[i][12])]);
  }
  print(indexList)
  var chart = ui.Chart.array.values(ee.List(indexList), 0, ee.List(dateList))
                .setChartType("LineChart")
                .setSeriesNames(bandsCSV)
                .setOptions({
                  title: "Indexs List",
                  vAxis: {title: "Index Value"},
                  hAxis: {title: "Point Index"}
                });
  print("chart", chart);
})
//end=====================================================================================================

/**
classified
*/
//start===================================================================================================                                
trainpoint120 = trainpoint120_2015.randomColumn('random');
var sample_training = trainpoint120.filter(ee.Filter.lte("random", 0.7)); 
var sample_validate  = trainpoint120.filter(ee.Filter.gt("random", 0.7));

// print("sample_training", sample_training);
print("sample_validate", sample_validate.geometry());

//生成监督分类训练使用的样本数据
var training = l8ColCart.sampleRegions({
  collection: sample_training, 
  properties: ["type"], 
  scale: 30
});
//生成监督分类验证使用的样本数据
var validation = l8ColCart.sampleRegions({
  collection: sample_validate, 
  properties: ["type"], 
  scale: 30
});
// print(validation)
// //Classifier
// //初始化分类器cart
// var classifier = ee.Classifier.cart().train({
//   features: training, 
//   classProperty: "type",
//   inputProperties: bands
// });

// //Make a Random Forest classifier and train it.
//https://geohackweek.github.io/GoogleEarthEngine/05-classify-imagery/
// var classifier = ee.Classifier.randomForest().train({
//   features: training,
//   classProperty: 'type',
//   inputProperties: bands
// });

////SVM
// var classifier = ee.Classifier.svm().train({
//   features: training,
//   classProperty: 'type',
//   inputProperties: bands
// });

////ALbedo-NDVI classification:DDI
// var DDItraining = l8ColCart.sample({
//   region: geometry,
//   scale: 30,
//   numPixels: 1000
// });
// var t = DDItraining.select(['Albedo',"NDVI"])
// var Albedo = t.reduceColumns(ee.Reducer.toList(), ["Albedo"]).get("list")
// var NDVI = t.reduceColumns(ee.Reducer.toList(), ["NDVI"]).get("list")
// var chart = ui.Chart.array.values({
//                 array: Albedo, 
//                 axis:0, 
//                 xLabels: NDVI
//               })
//               .setSeriesNames(["value"])
//               .setOptions({
//                 hAxis: {title: "NDVI" },
//                 vAxis: {title: "Albedo" },
//                 pointSize: 1,
//                 legend: 'none'
//               });
// print(chart);
// var arrList = ee.List(NDVI).zip(ee.List(Albedo));
// Export.table.toDrive({
//   collection:t,
//   description: "l8TrainConf",
//   folder:"training02",
//   fileFormat: "CSV"
// });
// print(arrList)
// var lf = arrList.reduce(ee.Reducer.linearFit());
// print(lf);
// //DDI
var type = l8ColCart.expression('3.53*NDVI-Albedo',
                        { NDVI:l8ColCart.select("NDVI"),
                          Albedo:l8ColCart.select("Albedo")
                        }).rename("type")
var DTstring = ['1) root 9999 9999 9999',
'2) type<0.618 9999 9999 0 *',
'3) type>=0.618 9999 9999 9999',
'6) type<1.498 9999 9999 1 *',
'7) type>=1.498 9999 9999 9999',
'14) type<2.269 9999 9999 2 *',
'15) type>=2.269 9999 9999 9999',
'30) type<2.986 9999 9999 3 *',
'31) type>=2.986 9999 9999 4 *'].join("\n");
var classifier = ee.Classifier.decisionTree(DTstring);
// print("classifier",classifier)
//影像数据调用classify利用训练数据训练得到分类结果
//ecisionTree  classifier
var classified = type.classify(classifier);
//other classifier
// var classified = l8ColCart.classify(classifier);

// // //训练结果的混淆矩阵
// var TrAccuracy = classifier.confusionMatrix();
// //导出训练精度结果CSV
// Export.table.toDrive({
//   collection: ee.FeatureCollection([
//     ee.Feature(null, {
//       matrix: TrAccuracy.array(),
//       kappa: TrAccuracy.kappa(),
//       accuracy: TrAccuracy.accuracy()
//     }
//   )]),
//   description: "l8TrainConf",
//   folder:"training01",
//   fileFormat: "CSV"
// });

//验证数据集合调用classify进行验证分析得到分类验证结果
var validated = validation.classify(classifier);
// print("validated",validated)
// //验证结果的混淆矩阵
var TeAccuracy = validated.errorMatrix("type", "classification");
// print(testAccuracy)
print(TeAccuracy.accuracy())
print(TeAccuracy.kappa())
print(TeAccuracy.consumersAccuracy())
print(TeAccuracy.producersAccuracy())
//导出验证精度结果CSV
// Export.table.toDrive({
//   collection: ee.FeatureCollection([
//     ee.Feature(null, {
//       matrix: TeAccuracy.array(),
//       kappa: TeAccuracy.kappa(),
//       accuracy: TeAccuracy.accuracy()
//     }
//   )]),
//   description: "2015",
//   folder:"tr",
//   fileFormat: "CSV"
// });
// var resultImg = classified.toByte();
// resultImg = resultImg.remap([0,1,2,3,4], [1,2,3,4,5]).updateMask(ESA2015urban);
//end=================================================================================================== 

/**
Export
*/
//start=================================================================================================
// //Raster
// Export.image.toAsset({
//   image: l5_7ImageCart, 
//   description: 'Asset-l8Classifiedmap',
//   assetId: "geometry2000img",
//   region: geometry,
//   scale:30,
//   crs: "EPSG:4326",
//   maxPixels: 1e13
// });
// Export.image.toDrive({
//   image: resultImg, // 要下载的影像
//   description: "img2015", // 下载任务描述，也是文件的默认名称
//   folder: 'geometry', // 选择要下载到云盘的哪个文件夹
//   region: geometry, // 裁剪区域
//   scale: 30, // 分辨率，
//   crs:"EPSG:4326",
//   maxPixels: 1e13 // 下载数据的最大像元数
// });
//end===================================================================================================
var visParamsl8Col = {
  bands: ['B5', 'B4', 'B3'],
  min: 0,
  max: 0.3,
  gamma: 1.4,
};

var visParamclassified = {
  min: 1,
  max: 5,
  palette: ['ff0200','ff9900','ffff00','80d600','2cab0b']
};
var geometry = 
    /* color: #0b4a8b */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[77.07373046875, 38.84382273520147],
          [77.07373046875, 35.928922837806645],
          [82.47900390625, 35.928922837806645],
          [82.47900390625, 38.84382273520147]]], null, false),
    sandPer = ee.Image("OpenLandMap/SOL/SOL_SAND-WFRACTION_USDA-3A1A1A_M/v02");
// Map.addLayer(resultImg, visParamclassified, "resultImg"); 
// Map.addLayer(l8ColCart,visParamsl8Col,"l8col")
// Map.addLayer(CloudMask,{},"CloudMask")
// Map.addLayer(PointMesLay,{},"PointMesLay",false)

// var confusionPoint = geometry
/**
Legend
*/
/** Create a panel to hold title,legend components.
Creates a color bar thumbnail image for use in legend from the given color
*/
var visParamFVC = {
  min: 0, 
  max: 1,
  palette: ["FFFFFF", "CE7E45", "DF923D", "F1B555", "FCD163", 
            "99B718", "74A901", "66A000", "529400", "3E8601", 
            "207401", "056201", "004C00", "023B01", "012E01", 
            "011D01", "011301"]
};
var legend  = require('users/seibertli602/public:js/legend.js');
var legendFVC  = legend.grad_legend(visParamFVC, '2000 FVC', false); 
legend.add_lgds([legendFVC]);