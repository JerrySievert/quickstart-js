// 
// Quick Start App
//-------------------------------
/*** Author: Allan Laframboise (alaframboise@esri.com)
/*** Date: 10/13/2012 ***/

var activeToolId;
var activeModuleId = "basemaps";
var codeVisible = false;
var appLocked = false;

function setActiveModule(ctrl, enableZoom) {
    //if (appLocked) return;
    activeModuleId = ctrl.id;
    showMapInfo(ctrl);
    if (codeVisible) 
        showCode();  // TODO
    wireEvents(ctrl);
    //lockMapNavigation(false);
}

function setActiveTool(ctrl) {
    activeToolId = ctrl.id;
    // Lock map to digitize
    if (activeToolId == "clear")
        map.enableDoubleClickZoom();
    else
        map.disableDoubleClickZoom();

    // Set user message - TODO
    switch (activeToolId) {
        // Add Graphics
        case "addPoint":
            clearAddGraphics(true);
            setMessage("Click the map to draw a point");
            break;
        case "addLine":
            clearAddGraphics(true);
            setMessage("Click the map to draw a line. Double-click to finish.");
            break;
        case "addPolygon":
            clearAddGraphics(true);
            setMessage("Click the map to draw a polygon. Double-click to finish.");
            break;
        // Directions
        case 'addStart':
            setMessage("Click the map to draw a polygon. Double-click to finish.");
            break;
        case 'addStop':
            setMessage("Click the map to draw a polygon. Double-click to finish.");
            break;
        default:
            setMessage("Click a button to start");
    }
    //setSelected(ctrl);
}

function showMapInfo(ctrl) {
    if (ctrl.id == "directions") {
        setStyle("mapItems", "show");
    } else {
        setStyle("mapItems", "hide");        
    }
}

function wireEvents(ctrl) {
    if (!map || !ctrl) return;
    var id = ctrl.id;
    map.removeListeners("onClick");
    map.removeListeners("onMouseUp");
    map.removeListeners("onMouseDown");
    map.removeListeners("onDblClick");

    switch (id) {
        case 'graphics':
            map.addListener("onClick", addGraphicCallback); 	
            map.addListener("onDblClick", addGraphicCallback);
            break;
        case 'places':
            map.addListener("onClick", onClickFindAddressCallback);
            break;
        case 'directions':
            map.addListener("onClick", onClickFindDirectionsCallback);
            break;
        case 'cloud':
            map.addListener("onClick", onClickSelectByDistanceCallback);
            break;
        default:
    }
}

//
// Add Graphics
//-------------------------------
var pts;

// Listen for mouse click events
function addGraphicCallback(evt) {
    if (activeToolId !="addPoint" && activeToolId != "addLine" && activeToolId != "addPolygon")
        return;
    var pt = evt.mapPoint;
    clearAddGraphics(false);

    var finished = (evt.type == "dblclick" || evt.type == "touchend");
    switch (activeToolId) {
        case 'addPoint':
            addPoint(pt, finished);
            break;
        case 'addLine':
            addLine(pt, finished);
            break;
        case 'addPolygon':
            addPolygon(pt, finished);
            break;
        default:
    }
}

// Add point graphic
function addPoint(pt, finished) {
    //clearAddGraphics(true);
    var options = { title: "Point", content: "Latitude: " + pt.getLatitude(5) + "</br>Longitude: " + pt.getLongitude(5), attributes: { "ID": "myPoint"} };
    map.graphics.addPoint(pt, options);
}

// Add line graphic
function addLine(pt, finished) {
    //clearAddGraphics(true);
    if (!pts) pts = [];
    pts.push(pt);
    map.graphics.addPoint(pt, { attributes: { "ID": "temp"} });
    if (pts.length > 1) {
        var options = { title: "Line", content: "Points: " + pts.length, attributes: { "ID": "myLine"} };
        map.graphics.addLine(pts, options);
    }
    if (finished) {
        map.graphics.removeByAttribute("ID", "temp");
        pts = null;
    }
}

// Add polygon graphic
function addPolygon(pt, finished) {
    //clearAddGraphics(true);
    if (!pts) pts = [];
    if (pt) {
        pts.push(pt);
        map.graphics.addPoint(pt, { attributes: { "ID": "temp"} });
    }
    if (pts.length > 1)
        map.graphics.addPolygon(pts, { attributes: { "ID": "myPolygon"} });
    if (finished) {
        if (pts.length > 2) {
            pts.push(pts[0]);
            var options = { title: "Polygon", content: "Points: " + (pts.length - 1), attributes: { "ID": "myPolygon"} }
            map.graphics.addPolygon(pts, options);
        }
        map.graphics.removeByAttribute("ID", "temp");
        pts = null;
    }
}

function clearAddGraphics(clearTemp) {
    map.graphics.removeByAttribute("ID", "myPoint");
    map.graphics.removeByAttribute("ID", "myLine");
    map.graphics.removeByAttribute("ID", "myPolygon");

    map.infoWindow.hide();

    if (clearTemp) {
        map.graphics.removeByAttribute("ID", "temp");
        pts = null;
    }
}

//
// Find Places
//-------------------------------

function findPlaces(place) {
    var placeFilter = document.getElementById('placeFilter').value;
    var searchExtent;

    if (document.getElementById('useMapExtent').checked)
        searchExtent = map.extent;
                
    // Set place options
    var searchOptions = { place: place,  // e.g. Redlands, 380 New York St, Starbucks...
        placeType: placeFilter,  // e.g. Coffee Shop, Gas Station, Shopping...
        searchExtent: searchExtent  // if null, it will search the global database
    }

    geocodeService.findPlaces(searchOptions, geocodeResults, geocodeErrorHandler);
    setStyle("progress", "in-progress visbile");
}

function onClickFindAddressCallback(evt) {
	var filter = document.getElementById('placeFilter').value;
	if (filter != "---")
		geocodeService.findPlaces({ place: filter, searchExtent: map.extent }, geocodeResults, geocodeErrorHandler);
	else
		geocodeService.findAddressFromPoint({ mapPoint: evt.mapPoint }, geocodeResults, geocodeErrorHandler);
}

function geocodeResults(places) {
    setStyle("progress", "in-progress hide");
	if (places.length > 0) {
		clearFindGraphics();

		for (var i = 0; i < places.length; i++) {
		    var place = places[i];
		    var lat = place.point.getLatitude(5);
		    var lon = place.point.getLongitude(5);
		    map.graphics.addPoint(place.point, { title: "<b>Geocode Result</b>",
		        content: place.address + "<br/>Lat/Lon: " + lat + "," + lon +
                "<br/>Locator Type: " + place.locatorType + "<br/>Place Type: " + place.placeType + "<br/>Address Type: " + place.addressType + "<br/> Score: "
                + place.score + "<button class='btn btn-link pull-right' onclick='zoomToPlace(" + lat + "," + lon + ",15)';>Zoom To</button>",
		        symbol: map.defaultSymbols.Geolocation,
		        attributes: { "ID": "PlacesGraphicID"}
		    });
		}

		zoomToPlaces(places);

	} else {
		alert("Sorry, address or place not found.");
	}
}

function geocodeErrorHandler(errorInfo) {
    setStyle("progress", "in-progress hide");
	alert("Sorry, address not found!");
}

function zoomToPlaces(places) {
	var multiPoint = new esri.geometry.Multipoint();
	for (var i = 0; i < places.length; i++) {
		multiPoint.addPoint(places[i].point);
	}
	map.setExtent(multiPoint.getExtent().expand(2.0));
}

function zoomToPlace(lat,lon,scale) {
    map.centerAtLatLon(lat,lon, scale);
}

function clearFindGraphics() {
    map.graphics.removeByAttribute('ID', 'PlacesGraphicID');
    map.graphics.clearAll(true);
}

//
// Directions
//----------------------------

var directions;
var mapItems;

// Add graphics when user clicks map
function onClickFindDirectionsCallback(evt) {
    var pt = evt.mapPoint;
    switch (activeToolId) {
        case 'addStart':
            addStartStopGraphic(pt, map.defaultSymbols.Start, "START");
            break;
        case 'addStop':
            addStartStopGraphic(pt, map.defaultSymbols.Stop, "STOP");
            break;
        default:
    }
}

// Add start stop graphics to map
function addStartStopGraphic(pt, symbol, id) {
    // Remove old graphics
    map.graphics.removeByAttribute("ID", id);
    map.graphics.removeByAttribute("ID", "ROUTE");
    map.graphics.removeByAttribute("ID", "SEGMENT");
    // Add the new start/stop graphic
    map.graphics.addPoint(pt, { title: "<b>Directions " + id + "</b>",
        content: pt.getLatitude(5) + " " + pt.getLongitude(5),
        symbol: symbol,
        attributes: { "ID": id }
    });
    // Find route directions
    getDirections();
}

// Draw route graphics
function getDirections() {
    var startGraphic = map.graphics.findByAttribute("ID", "START")[0];
    var stopGraphic = map.graphics.findByAttribute("ID", "STOP")[0];
    if (startGraphic && stopGraphic) {
        setStyle("progress", "in-progress visbile");
        routeService.getDirections({ stops: [startGraphic.geometry, stopGraphic.geometry] }, function (routeInfo) {
            setStyle("progress", "in-progress hide");
            if (routeInfo) {
                if (routeInfo.routeResults && routeInfo.routeResults.length > 0) {
                    directions = routeInfo.routeResults[0].directions;
                    //  Add route to map
                    map.graphics.addLine(directions.mergedGeometry,
                                     { title: "<b>Route</b>",
                                         content: "Distance: " + directions.totalLength.toFixed(1) + " miles<br>" + "Time: " + directions.totalTime.toFixed(1) + " minutes",
                                         symbols: map.defaultSymbols.Line,
                                         attributes: { "ID": "ROUTE" },
                                         placement: "bottom"
                                     });
                    // Zoom to route
                    map.setExtent(directions.mergedGeometry.getExtent().expand(2.0));
                    // Show turn-by-turn directions
                    showDirections(directions);
                }
            }
            else {
                alert("Could not find route.");
            }
        }, function (error) {
            setStyle("progress", "in-progress hide");
            alert("Could not find route.");
        });

    }
}

// Display turn-by-turn directions
function showDirections(directions) {
    // Find the list to populate
    if (!mapItems)
        mapItems = document.getElementById('mapItems');

    var dirStrings = [];
    dirStrings.push("<ul>");
    for (var i = 0; i < directions.features.length; i++) {
        var feature = directions.features[i];
        feature.attributes.text = feature.attributes.text + " (" + feature.attributes.length.toFixed(2) + " miles )";
        dirStrings.push("<li id=item" + i + " class='btn btn-inverse btn-block' onmouseover='selectDirection(" + i + ",false);' onmousedown='selectDirection(" + i + ",true);'>" + (i + 1) + ". " + feature.attributes.text + "</li>");
    }
    dirStrings.push("</ul>");
    
    mapItems.innerHTML = dirStrings.join("");
    //setStyle("mapItems", "infoList visible");
}

// Highlight and zoom to route segment
function selectDirection(index, zoom) {
    if (index > -1) {
        var segment = directions.features[index];
        var title = "Direction: " + (Number(index) + 1);
        var text = segment.attributes.text;
        // Create segment graphic
        map.graphics.removeByAttribute("ID", "SEGMENT");
        map.graphics.addLine(segment.geometry, { title: title, content: text, symbol: map.defaultSymbols.Route, attributes: { "ID": "SEGMENT"} });
        // Show popup
        map.infoWindow.setTitle(title);
        map.infoWindow.setContent(map.graphics.findByAttribute("ID", "SEGMENT")[0].infoTemplate.content);
        map.infoWindow.show(segment.geometry.getPoint(0, 0));
        if (zoom)
            map.centerAt(segment.geometry.getPoint(0, 0), map.getLevel());
    }
}

function clearDirectionGraphics() {
    mapItems.innerHTML = "";
    map.graphics.clearAll(true);  // TODO
}

//
// Cloud
//----------------------------

var graphicsLayer;
var featureLayer;

function loadLayers() {
    // Cloud feature service
    if (graphicsLayer && featureLayer) {
        map.centerAtLatLon(35, -95, 4);
        return;
    }

    setStyle("progress", "in-progress visible");

    // Add graphics layer for search circle
    graphicsLayer = new esri.layers.GraphicsLayer();
    map.addLayer(graphicsLayer);

    // Add feature layer
    featureLayer = new esri.layers.FeatureLayer("http://services.arcgis.com/oKgs2tbjK6zwTdvi/arcgis/rest/services/Major_World_Cities/FeatureServer/0", {
        mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"],
        opacity: .90,
        infoTemplate:  new esri.InfoTemplate("Feature Attributes", "${*}")
    });
    featureLayer.setDefinitionExpression("");
    featureLayer.renderer = new esri.renderer.SimpleRenderer(map.defaultSymbols.Geolocation);

    map.addLayer(featureLayer);

    // Zoom
    map.centerAtLatLon(35, -95, 4);

    setStyle("progress", "in-progress hide");
    // Activate controls
    setStyle("sqlInput", "input-block-level large");
    setStyle("searchBySQL", "btn btn-primary width99");
    setStyle("searchByDistanceInput", "width99");
    setStyle("searchByDistance", "btn btn-primary width99");
}

function searchBySQL() {
    if (!graphicsLayer || !featureLayer)
        return;

    var sql = document.getElementById('sqlInput').value;
    featureLayer.setDefinitionExpression(sql);
}

function onClickSelectByDistanceCallback(evt) {
    if (!graphicsLayer || !featureLayer) 
        return;

    setStyle("progress", "in-progress visible");

    var options = {point: evt.mapPoint, 
        distance: document.getElementById('searchByDistanceInput').value,
        units: esri.tasks.GeometryService.UNIT_STATUTE_MILE
    }
    // Get search circle and select features
    geometryService.getCircle(options, function (geometries) {
        if (geometries.length > 0) {
            var area = geometries[0];
            graphicsLayer.removeByAttribute("ID", "SEARCHAREA");
            var options = { title: "Search Circle", content: "Points: " + (area.rings[0].length - 1), attributes: { "ID": "SEARCHAREA"} };
            graphicsLayer.addPolygon(area, options);

            //featureLayer.setDefinitionExpression("");  // Show all

            var query = new esri.tasks.Query();  // Select by shape
            query.geometry = area;
            featureLayer.setSelectionSymbol(map.defaultSymbols.Stop);
            featureLayer.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW);
        }
        setStyle("progress", "in-progress hide");
    },
        function (err) {
            console.log(Error);
            setStyle("progress", "in-progress hide");
        });
}

function selectAll() {
    loadLayers();
    featureLayer.setDefinitionExpression("");
}

function clearCloudGraphics() {
    if (!graphicsLayer || !featureLayer) return;

    featureLayer.setDefinitionExpression("1=0");
    featureLayer.selectFeatures(null, esri.layers.FeatureLayer.SELECTION_NEW);

    graphicsLayer.clear();
    setActiveTool("clear");

    setStyle("progress", "in-progress hide");
}


//
// Framework
//----------------------------
function setMessage(msg) {
    var element = document.getElementById("message");
    if (element)
        element.innerHTML = msg;
}

function setSelected(button) {
    var elements = document.getElementsByClassName('button');
    for (var i = 0; i < elements.length; i++) {
        setStyle(elements[i], "button");
    }
    button.className = "button selected";
}

function setStyle(elementName, className) {
    var elem = document.getElementById(elementName);
    elem.className = className;
}

function setElementStyle(element, className) {
   if (element)
    element.className = className;
}

function showCode() {
    var elements = document.getElementsByClassName("code-window");
    var elementId = activeModuleId + "Code";
    var element;
    
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].id == elementId)
            element = elements[i];
        else
            setElementStyle(elements[i], "code-window hide");
    }

    //var elem = document.getElementById(activeModuleId + "Code");
    if (element.className.indexOf('hide') != -1) {
        setElementStyle(element, "code-window show");
        codeVisible = true;
    }        
    else {
        setElementStyle(element, "code-window hide");
        codeVisible = false;
    }
}