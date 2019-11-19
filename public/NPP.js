/**
 * Calcute ANPP,PNPP and HANPP in GEE
 * 
 * Saibo Li
 * Update 20191119
 * 
 * ------------------------------
 * It is recommended to refer to the algorithm in the script. 
 * The data in the script is test data. 
 * It is recommended not to use the direct running results for other purposes.
 * 
 */

 var Pre = ee.ImageCollection("IDAHO_EPSCOR/TERRACLIMATE"),
    ModisNPP = ee.ImageCollection("MODIS/006/MOD17A3H"),
    Tem = ee.ImageCollection("NASA/GLDAS/V021/NOAH/G025/T3H"),
    geometry = 
    /* color: #98ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[110.77978515625, 41.684274533027434],
          [110.77978515625, 34.283407168396906],
          [121.32666015625, 34.283407168396906],
          [121.32666015625, 41.684274533027434]]], null, false);

//data preprocessing
Map.setOptions("SATELLITE");
Map.centerObject(geometry,5)
Map.addLayer(geometry, {color: "black",optional:1},'geometry');

var dataset = ModisNPP;

var HANPP = function(img){
  var Anpp = img.select('Npp').clip(geometry).multiply(0.1);
  var startTime = img.get("system:time_start");
  var endTime = img.get("system:time_end")
  Pre = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
           .filter(ee.Filter.date(startTime,endTime))
           .select('pr')
           .reduce(ee.Reducer.sum())
           .clip(geometry);
  Tem = ee.ImageCollection('NASA/GLDAS/V021/NOAH/G025/T3H')
           .filter(ee.Filter.date(startTime,endTime))
           .select('Tair_f_inst')
           .reduce(ee.Reducer.mean())
           .clip(geometry)
           .subtract(273.15);
  var L = Tem.multiply(25).add(3000).add(Tem.pow(3).multiply(0.05));
  var V = L.expression(
            "1.05*r/sqrt(1+(1+1.05*r/L)*(1+1.05*r/L))",{
            r:Pre,
            L:L
          });
  var PNPP = V.expression(
            "3000*(1-exp(-0.0009695*(v-20)))",{
            v:V
          }).rename("PNPP");
  //HANPP = PNPP-ANPP
  return PNPP.subtract(Anpp).rename("HANPP");
}

var ANPPdataset = function(img){
  return img.select("Npp").clip(geometry).multiply(0.1).rename("ANPP");
}

var PNPPdataset = function(img){
  var startTime = img.get("system:time_start");
  var endTime = img.get("system:time_end")
  Pre = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
           .filter(ee.Filter.date(startTime,endTime))
           .select('pr')
           .reduce(ee.Reducer.sum())
           .clip(geometry);
  Tem = ee.ImageCollection('NASA/GLDAS/V021/NOAH/G025/T3H')
           .filter(ee.Filter.date(startTime,endTime))
           .select('Tair_f_inst')
           .reduce(ee.Reducer.mean())
           .clip(geometry)
           .subtract(273.15);
  var L = Tem.multiply(25).add(3000).add(Tem.pow(3).multiply(0.05));
  var V = L.expression(
            "1.05*r/sqrt(1+(1+1.05*r/L)*(1+1.05*r/L))",{
            r:Pre,
            L:L
          });
  var PNPP = V.expression(
            "3000*(1-exp(-0.0009695*(v-20)))",{
            v:V
          }).rename("PNPP");
  return PNPP.rename("PNPP");
}

var HANPPdataset = dataset.map(HANPP)
var ANPPdataset = dataset.map(ANPPdataset)
var PNPPdataset = dataset.map(PNPPdataset)


// 使用缩略图来制作展示 
var args = { 
  crs: 'EPSG:4326', 
  framesPerSecond: 1, 
  region: geometry, 
  min: 0.0, 
  max: 1200.0, 
  palette: ['bbe029', '0a9501', '074b03'], 
  dimensions: 1024, 
}; 
var nppVis = {
    min: 0.0,
    max: 1200.0,
    palette: ['bbe029', '0a9501', '074b03'],
};
var thumbnail = ui.Thumbnail({
  image:ANPPdataset,
  params:args,
  style: {
    position: 'bottom-right',
    width: '600px',
    height:'600px'
  }
  
});
print(thumbnail)


//Slope
var slopeNpp = function(imageDataset){
  var list = imageDataset.toList(20);
  var n = list.size().getInfo();
  var img = imageDataset.first()
  // Map.addLayer(img, nppVis, 'img0');
  for (var i=1; i<n; i++){
    var image = ee.Image(list.get(i));
    var j = ee.Number(i).add(ee.Number(1));
    // print(j)
    // Map.addLayer(image, nppVis, 'img');
    image = image.multiply(j)
    img = img.add(image)
  }
  var img2 = imageDataset.first()
  for (var u=1; u<n; u++){
    var image2 = ee.Image(list.get(u));
    img2 = img2.add(image2)
  }
  var SlopeNPPUp = img.multiply(16).subtract(img2.multiply(136))
  var SlopeNPPdown = ee.Number(16).multiply(ee.Number(1496)).subtract(ee.Number(18496))
  return SlopeNPPUp.divide(SlopeNPPdown)
}

var SlopeHANPP = slopeNpp(HANPPdataset);
var SlopeANPP = slopeNpp(ANPPdataset);
var SlopePNPP = slopeNpp(PNPPdataset);

//slope
var slopeHuman =  SlopeHANPP.abs().divide(SlopeHANPP.abs().add(SlopePNPP.abs()))
var slopeNature =  SlopePNPP.abs().divide(SlopeHANPP.abs().add(SlopePNPP.abs()))

Export.image.toDrive({
  image: SlopePNPP, 
  description: 'SlopePNPP',
   folder: 'geometry',
  region: geometry,
  scale:1000,
  crs: "EPSG:4326",
  maxPixels: 1e13
});

var nppVis = {
  min: -3000.0,
  max: 200.0,
  palette: ['bbe029', '0a9501', '074b03'],
};

Map.addLayer(slopeNature,nppVis,"slopeNature")




