//replace the url for the spreadsheet being mapped here. DO NOT COPY THE URL FROM THE 'PUBLISH' WINDOW; take the URL from the browser's address bar up to the /edit#gid=1234, put all that before the /pubhtml in the URL below
window.onload=function(){
	getSpreadsheet('https://docs.google.com/spreadsheets/d/140U2nF-MRkRtY3eOGp4vlBughCFjTKaSRInM4XPw46U/pubhtml');
}

//all of this is happening asynchronously; the callback is telling Tabletop to build the map using the spreadsheet
function getSpreadsheet(key){
  Tabletop.init( {
    key: key,
    callback: buildMap,
    simpleSheet: true
  });
}

function buildMap(data, tabletop) {

L.mapbox.accessToken = 'pk.eyJ1IjoiY29yZS1naXMiLCJhIjoiaUxqQS1zQSJ9.mDT5nb8l_dWIHzbnOTebcQ';

  // build map
  var map = L.mapbox.map('map').setView([38.638327,-90.285151],15);
  L.mapbox.styleLayer('mapbox://styles/core-gis/cjc84jy4y1yz92smjivoelmd8').addTo(map);
  map.zoomControl.setPosition('topright');
  attributionControl:  false;
  map.options.minZoom = 14;
  map.options.maxZoom = 18;
  map.setMaxBounds([
	[38.603576, -90.308175], //southwest map coordinates
    [38.673187, -90.259509] //northeast map coordinates
	])

// Add customized attribution  
var attribution = L.control.attribution();
attribution.setPrefix('');
attribution.addAttribution('<a href="http://coregis.net">Map created by CORE GIS</a>');
attribution.addTo(map);
	
  var points = L.featureGroup();
  var accomplishment = L.featureGroup();
  var construction = L.featureGroup();
  var greencare = L.featureGroup();

  for(var i=0;i<data.length;i++) {
    var marker = L.marker([parseFloat(data[i].lat), parseFloat(data[i].lng)]);
    var popupInfo = metadata(data[i]);

	//type in your desired dimensions for the markers; the marker will always be square
	var iconDim = 31;
	category = data[i].category.toLowerCase();
	marker.setIcon( L.icon({
		iconUrl: "markers/" + data[i].markerfile,
		iconSize: [iconDim, iconDim],
		iconAnchor: [iconDim/2, iconDim*0.9],
		popupAnchor: [0, 0]
		/*shadowUrl: 'my-icon-shadow.png',
		shadowSize: [68, 95],
		shadowAnchor: [22, 94]*/
	}));
    marker.bindPopup(popupInfo,{'maxWidth':'300','maxHeight':'350','minWidth':'200'});
    points.addLayer(marker);
	if (category === "accomplishment") {
	   accomplishment.addLayer(marker);
	}
	else if (category === "greencare") {
	   greencare.addLayer(marker);
	}
	else if (category === "construction") {
	   construction.addLayer(marker);
	}
}

/* IMPORTANT!
The subheadings in the legend are not controlled by anything in this file.
Instead, they are controlled by CSS rules, using only the order of items to specify where they go.
So any change in the order or number of layers in the legend will need to have a corresponding change made to the CSS file.
To do this, go to:
	css/alternative-voting-style.css
And search for the selectors that include:
	div.leaflet-control-layers-overlays label:nth-child
For each of those, the number in () specifies which legend item they are putting a subheading before.
*/
  var overlayMaps = {
    "<img src='markers/accomplishment.svg' height=24>Accomplishment": accomplishment,
	"<img src='markers/construction.svg' height=24>Construction/Maintenance": construction,
	"<img src='markers/greencare.svg' height=24>Green Care": greencare
  };


  //This is intended to make the legned collapse by default on mobile devices
  //from http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
  var windowWidth = 0;

  if( typeof( window.innerWidth ) === 'number' ) {
  windowWidth = window.innerWidth;
} else if( document.documentElement && document.documentElement.clientWidth ) {
  windowWidth = document.documentElement.clientWidth;
} else if( document.body && document.body.clientWidth ) {
  windowWidth = document.body.clientWidth;
}

if (windowWidth < 400) {
  var collapseLegend = true;
} else {
  var collapseLegend = false;
}


// This line adds layers to the _legend_
  L.control.layers(false, overlayMaps, {position: 'topleft', collapsed:true}).addTo(map);

// This set of lines loads layers to the map
  map.addLayer(accomplishment);
  map.addLayer(construction);
  map.addLayer(greencare);

  var bounds = points.getBounds();
  map.fitBounds(bounds, {padding:[30,30]});

  map.setView(map.getCenter());

  map.on('click', function(e) {
    var coords = document.getElementById('coords');
    coords.innerHTML="<p>Lat: <strong>" + e.latlng.lat + "</strong>, Lng: <strong>" + e.latlng.lng+"</strong>";
  });
}

//add fields here that you do not want displayed in the popupInfo. Must be all lowercase

function metadata(properties) {
  //This is equivalent to the first row of the spreadsheet, these are the field names; field names are called keys
  var obj = Object.keys(properties);
  //This is all of the HTML that goes into the popup
  var info = "";
  for(var p=0; p<obj.length; p++) {
    var prop = obj[p];
    if (prop != 'lat' &&
        prop != 'lng' &&
		prop != 'single-or-multi' &&
		prop != 'category' &&
		prop != 'category-old' &&
		prop != 'subcategory-display' &&
        prop != 'marker-color' &&
        prop != 'markerfile' &&
		prop != 'active' &&
        prop != 'rowNumber' &&
		prop != 'moreinfo-text1' &&
        prop != 'moreinfo-text2' &&
        prop != 'moreinfo-text3' &&
        prop != 'moreinfo-text4' &&
        prop != 'rowNumber' &&
        prop != 'sort' &&
        prop != 'school' &&
        prop != 'statewide' &&
		properties[prop].length > 0) {
      //prop is the field name from the spreadsheet; properties is the geoJSON generated from one row of the spreadsheet
	  //INSTEAD OF PROP, NEED TO WRITE A NEW FUNCTION THAT DOES TEXT SUBSTITUTIONS
	  //get rid of <strong>"+prop+"</strong>: to not show the field names in the popup
	  info += "<p class='"+prop+"'>"+properties[prop]+"</p>";
    }
  }
//console.log(info);
  return info;
}

function showErrors(err) {
  console.log(err);
}
