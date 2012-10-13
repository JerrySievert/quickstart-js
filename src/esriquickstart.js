/*** Esri JavaScript Quick Start Library v 0.1 ***/
/*** Author: Allan Laframboise (alaframboise@esri.com)
/*** Date: 10/13/2012 ***/

//  Provides extensions to simplify development with the ArcGIS JavaScript API.
// -  hook map events without dojo.connect
// -  auto-wire onLoad() callbacks for all graphics and zoom functions
// -  simple map creation, resizing and zooming with extended "options"
// -  easily swap ArcGIS Online basemap layers (no REST endpoints) 
// -  use of lat/lon coordinates instead of extents
// -  no spatial references required, auto-projects geometries
// -  easily add points, lines and polygons with popups 
// -  easier access to ArcGIS Online geoservices 

//  Extended Classes
//  esri.Map, esri.layers.GraphicsLayer, esri.geometry.Point

//  New Classes
//  esriqs.arcgisonline.GeocodeService, esriqs.arcgisonline.RouteService, esriqs.arcgisonline.GeometryService 
//  esriqs.Geoservice.Endpoints, esriqs.DefaultSymbols 
//  esriqs.GeoHelper, esriqs.Listener

dojo.require("esri.map");
dojo.require("esri.symbol");
dojo.require("esri.layers.graphics");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.tasks.locator");
dojo.require("esri.tasks.route");
dojo.require("esri.tasks.geometry");      
dojo.require("esri.utils");
dojo.require("esri.arcgis.utils");
dojo.require("esri.dijit.Popup");
dojo.require("esri.dijit.BasemapGallery");
dojo.require("dijit.TooltipDialog");
dojo.require("esri.IdentityManager");

dojo.ready(function () {

    // dojo config params
    var dojoConfig = {
        parseOnLoad: true,
        isDebug: true
    };

    /*** Esri Gobals ***/
    //esri.config.defaults.io.proxyUrl = "http://arcgis.com/arcgisserver/apis/javascript/proxy/proxy.ashx";
    //esri.config.defaults.io.corsEnabledServers = true;

    /**************************************************************************************************************************/
    /*** Default Basemap Types class ***/
    /**************************************************************************************************************************/  
	// Provide references to common ArcGIS Online basemap REST endpoint references

    dojo.declare("esriqs.DefaultBasemapTypes", null,
    {
        "STREETS": "STREETS",
        "SATELLITE":"SATELLITE",
        "TOPOGRAPHIC":"TOPOGRAPHIC",
        "GRAYCANVAS": "GRAYCANVAS"
    }),

    /**************************************************************************************************************************/
    /*** Default Geoservice Endpoints class***/
    /**************************************************************************************************************************/
    // Provide references to the main ArcGIS Online Geoservice REST endpoints

    dojo.declare("esriqs.Geoservice.Endpoints", null,
    {
            "GEOCODE": "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
            "ROUTE": "http://tasks.arcgisonline.com/ArcGIS/rest/services/NetworkAnalysis/ESRI_Route_NA/NAServer/Route",
            "GEOMETRY": "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
    }),

    /**************************************************************************************************************************/
    /*** Default Symbols class***/
    // Provide some common out-of-the-box symbols for points, lines and polygons
    
    dojo.declare("esriqs.DefaultSymbols", null,
    {
       "_symbolUrlGeolocation": "http://static.arcgis.com/images/Symbols/Shapes/BluePin1LargeB.png",
        "_symbolUrlStart": "http://static.arcgis.com/images/Symbols/Shapes/GreenPin1LargeB.png",
        "_symbolUrlStop":"http://static.arcgis.com/images/Symbols/Shapes/RedPin1LargeB.png",
        "_symbolUrlGeocode":"http://static.arcgis.com/images/Symbols/Shapes/OrangePin1LargeB.png",
        "_symbolUrlReverseGeocode":"http://static.arcgis.com/images/Symbols/Shapes/YellowPin1LargeB.png",
        "_symbolUrlRouteMarker":"http://static.arcgis.com/images/Symbols/Shapes/GreenCircleLargeB.png",
        "_symbolSize": 28,
        "_symbolXOffset": 0,
        "_symbolYOffset": 14,
        "_symbolColorDefault": new dojo.Color([255, 0, 0, 0.75]),

        "Geolocation": null,
        "Start": null,
        "Stop": null,
        "Geocode": null,
        "ReverseGeocode": null,
        "Point": null,
        "Line": null,
        "Polygon": null,
        "Route": null,
        "RouteMarker": null,

        constructor: function () {
            this._init();
        },

        _init : function () {

            // Default symbols
            function createPictureSymbol(url, xOffset, yOffset, size) {
                return new esri.symbol.PictureMarkerSymbol(
			    {
			        "angle": 0,
			        "xoffset": xOffset, "yoffset": yOffset, "type": "esriPMS",
			        "url": url,  
			        "contentType": "image/png",
			        "width":size, "height": size
			    });
            }

            // Picture Symbols
            this.Geolocation = createPictureSymbol(this._symbolUrlGeolocation, this._symbolXOffset, this._symbolYOffset, this._symbolSize);
            this.Start = createPictureSymbol(this._symbolUrlStart, this._symbolXOffset, this._symbolYOffset, this._symbolSize);
            this.Stop = createPictureSymbol(this._symbolUrlStop, this._symbolXOffset, this._symbolYOffset, this._symbolSize);
            this.Geocode = createPictureSymbol(this._symbolUrlGeocode, this._symbolXOffset, this._symbolYOffset, this._symbolSize); 
            this.ReverseGeocode = createPictureSymbol(this._symbolUrlReverseGeocode, this._symbolXOffset, this._symbolYOffset, this._symbolSize); 

            // Geometry Symbols
            this.Point = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 7,
						    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
						    new dojo.Color([255, 0, 0]), 1),
						    this._symbolColorDefault); 

            this.Line = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, 
                this._symbolColorDefault, 
                2);

            this.Polygon = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, 
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, 
                this._symbolColorDefault, 1), new dojo.Color([255, 0, 0, 0.25]));    

            // Route symbols
            this.Route = new esri.symbol.SimpleLineSymbol().setColor(new dojo.Color([0, 255, 0, 0.5])).setWidth(4);
            this.RouteMarker =  createPictureSymbol(this._symbolUrlRouteMarker, 0, 0, 12);
         }
    }),

    /**************************************************************************************************************************/
    /*** Extended esri.Map class ***/
    /**************************************************************************************************************************/
    // Simplify how to create, configure and work with the esri.Map class
    // - wire map events and callbacks without dojo
    // - configure and control map settings with "options"
    // - easy to access, load and change default AGO basemap layers
    // - provide default symbols for points, lines and polygons
    // - center map with Lat,Lon, no spatial references required
    // - auto-center map at your geolocation
    // - auto-resize and reposition map
    // - onLoad callbackHandlers are all auto-wired 
    // - auto configures and repositions infoWindow
    // Alternative: esri.Map (without esriquickstart.js) 
    
    // Example:
    // var options = { zoom: 10,
    //                      center: new esri.geometry.Point(-81,46),
    //                      basemap: esri.arcgisonline.basemaps.STREETS };
    //  var map = new esri.Map("mapDiv", options);
    //  NOTES: Supports all default esri.Map behavior and options
    
    // More Examples
    // map.setBasemap(esri.arcgisonline.basemaps.STREETS); //Load basemaps via types instead of URLs 
    // new esri.Map({autoResize:true});  //Autoresize and recenter map when container changes
    // map.addListener("MouseDown", callbackFunction);  //Non-dojo method for event handling
    // map.centerAtLatLon(lon, lat, 10);  //Center map, auto-converts to spatial reference  
    // map.centerAtPoint(pt, 10); 
    // map.findMyLocation(callbackHandler. errorHandler); // Find geolocation
    // map.centerAtMyLocation(map.Geolocation, 10);  // Auto position map at browser's geolocation
    // map.getGraphicsLayer("myGraphicsLayer");  Easy way to find a graphics layer by "name"
    // InfoWindow - Automatically sets the default style of window
    // --------------------------------------------------------------------------------------------------------------------------

    dojo.declare("esri.Map", esri.Map,
    {
        "_listener": null,
        "_basemapGallery":null,
        "__lastCenter":null,
        "__delayedRecenter":200,

        // Extended members
        "defaultZoomLevel": 10,
        "defaultPopupWidth": 300,
        "defaultPopupHeight": 270,
        "defaultSymbols": null,
        
        // Override
        constructor: function (mapDiv, options) {
            options = options || {};
            this._init();
            this._setOptions(options);           
        },

        // Initialize map objects
        "_init": function () {
            try {
                // Set event listener
                this._listener = new esriqs.Listener(this);
                // Initialize graphics layer because it can't be used without a callback
                if (!this.graphics) {
                    this.graphics = new esri.layers.GraphicsLayer();
                    this.graphics._map = this;
                }
                // Set default symbols
                this.defaultSymbols = esri.esriDefaultSymbols;
            } catch (err) {
                console.log("Error initializing map. Check library references. " + err);
            }
        },
        
        // Set default and user-defined map options
        "_setOptions": function (options) {
            try {   
                // Standard option defaults
                // Set default 180 view                
                if ((options.showArcGISBasemaps === false) ? false : true)
                    this.wrapAround180 = true;
                //  Set default info window for map and graphics
                if (!options.infoWindow) {
                    var popupOptions = {
	                    "marginLeft": "100",
	                    "marginTop": "100"
	                };
	                var popup = new esri.dijit.Popup(popupOptions, dojo.create("div"));
                    this.infoWindow = popup;
                } 
                // New options
                // Set map auto resize and recentering
                if ((options.autoResize === false) ? false : true)
                    this.autoResize();
                // Set initial default AGO basemap (webmap)
                if (options.basemap)
                    this.setBasemap(options.basemap);
                // Set initial map center point lat,lon and zoom
                if (options.center)
                    this.centerAtPoint(options.center, (options.zoom) ? options.zoom : this.defaultZoomLevel);
            } catch (err) {
                console.log("Error intializing map. Check option values." + err);
            }     
        },

        // --------------------------------------------------------------------------------------------------------------------------
        // map.addListener, map.removeListeners
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Wire events without dojo
        // Atlernative to: dojo.connect()
        // Example: map.addListener("onClick", callbackHandler);
        // Example: map.removeListeners("onClick");
        // --------------------------------------------------------------------------------------------------------------------------

        "addListener": function (event, handler) {
            this._listener.add(event,handler);
        },

        "removeListeners": function (event) {
            this._listener.remove(event);
        },

        // --------------------------------------------------------------------------------------------------------------------------
        // map.setBasemap
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Simplify loading default AGO basemaps, no URL enpoints required, works onLoad
        // Atlernative to: map.addLayer()
        // Example: map.setBasemap(esri.arcgisonline.basemaps.STREETS);  //STREETS, SATELLITE, TOPOGRAPHY, GRAYCANVAS
        // --------------------------------------------------------------------------------------------------------------------------

        "setBasemap": function (basemapType) {
                // Use the basemapGallery and load via webmapIDs
                var loader;
                var timeout = 30;  //30 seconds

                // Find basemap by with esriDefaultBasemaps types once gallery is loaded
                function findBasemapId(basemapType,mapRef) {
                    var id;
                    var key;

                    switch (basemapType)
                    {
                    case esri.arcgisonline.basemaps.STREETS:
                        key = "Streets";
                        break;
                    case esri.arcgisonline.basemaps.SATELLITE:
                        key = "Imagery with Labels";
                        break;
                    case esri.arcgisonline.basemaps.TOPOGRAPHIC:
                        key = "Topographic";
                        break;
                    case esri.arcgisonline.basemaps.GRAYCANVAS:
                        key = "Light Gray Canvas";
                        break;
                    // TODO - add other basemaps?
                        }
                    for (var i=0; i < mapRef._basemapGallery.basemaps.length; i++) {
                        if (mapRef._basemapGallery.basemaps[i].title == key) {
                                id = mapRef._basemapGallery.basemaps[i].id;
                                i = mapRef._basemapGallery.basemaps[i].length;
                        }
                    }
                    return id;
                }

                // Initialize the basemap Gallery
                function loadBasemapGallery (basemapType, mapRef) {
                    try {

                        if (mapRef._basemapGallery || (!basemapType || (basemapType instanceof esriqs.DefaultBasemapTypes))) 
                            return;
      
                        if (!mapRef._basemapGallery) { 
                            mapRef._basemapGallery = new esri.dijit.BasemapGallery({
                                showArcGISBasemaps: true,
                                map: mapRef  // Don't hook up the map yet because dijit auto displays first basemap and it will flash!
                                
                            });
                        }

                        // Wait until loaded
                        var start = new Date();
                        loader = setInterval(function(){
                            var s = (new Date().getTime() - start.getTime()) /1000;
                            if (s > timeout) {
                                clearInterval(loader);  
                                console.log("Loading basemaps timeout.");  // failed
                            }  
                            if (mapRef._basemapGallery.loaded) {
                                setBasemapFunc(basemapType,mapRef);
                                clearInterval(loader);
                            } 
                        },10);
               
                        } catch(err) {
                            clearInterval(loader);
                            console.log("Error loading default basemaps. " + err);
                        }
                }

                // Load the correct basemap from the widget once gallery is loaded
                function setBasemapFunc(basemapType, mapRef) {
                    if (!basemapType) 
                        return;
                    if (!mapRef._basemapGallery) {
                        loadBasemapGallery(basemapType, mapRef);
                        return;
                    }
                    // Select the correct basemap
                    var id = findBasemapId(basemapType, mapRef);
                    switch (basemapType)
                    {
                        case esri.arcgisonline.basemaps.STREETS:
                            mapRef._basemapGallery.select(id);  //e.g. basemap_6
                            break;
                        case  esri.arcgisonline.basemaps.SATELLITE:
                            mapRef._basemapGallery.select(id);
                            break;
                        case  esri.arcgisonline.basemaps.TOPOGRAPHIC:
                            mapRef._basemapGallery.select(id);
                            break;
                        case esri.arcgisonline.basemaps.GRAYCANVAS:
                            mapRef._basemapGallery.select(id);
                            break;
                    }
            }        

            // Load basemap
            if (!this.loaded) {
                var initBasemap = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer", {visible:false});
                this.addLayer(initBasemap);  
//                dojo.connect(this, 'onLoad', function () {  
//                    setBasemapFunc(basemapType,this); 
//                });
                setBasemapFunc(basemapType,this);  // Includes custom onLoad() handler
            } else {
                setBasemapFunc(basemapType,this);
            }
        },

        // --------------------------------------------------------------------------------------------------------------------------
        // map.autoResize
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Simplify resizing and re-centering map
        // Atlernative to: dojo.connect(map, 'resize', handler);
        // Example: map.autoResize(true) or var map = esri.Map("mapDiv", {autoResize: true});
        // NOTE: 
        // --------------------------------------------------------------------------------------------------------------------------

         "autoResize": function () {  // TODO - add true/false
            
            var mapRef = this;

            var supportsOrientationChange = "onorientationchange" in window,
                    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

            function resizePopup(mapRef) {   
                var box = dojo.contentBox(mapRef.container);        
                var width = mapRef.defaultPopupWidth;
                var height = mapRef.defaultPopupHeight;
                    newWidth = Math.round(box.w * 0.60),             
                    newHeight = Math.round(box.h * 0.45);        
                if (newWidth < width) {
                    width = newWidth;
                }
                if (newHeight < height) {
                    height = newHeight;
                }
                mapRef.infoWindow.resize(width, height);
            }

            function orientationChanged(mapRef) {
                if (mapRef) {
                    // capture center to reposition propertly
                    mapRef.__lastCenter = mapRef.extent.getCenter();
                    mapRef.resize();
                    resizePopup(mapRef);
                }
            }

            // Auto resize map, attach for IE and others...
            if (window.addEventListener) {
                window.addEventListener(orientationEvent, function () { orientationChanged(mapRef); }, false);
            } else if (window.attachEvent) {
                window.attachEvent(orientationEvent, function () { orientationChanged(mapRef); }, false);
            }

            // Auto re-center map
            function repositionAfterResize(extent, width, height) {                
                setTimeout(function() {
			        mapRef.centerAt(mapRef.__lastCenter);
		        }, mapRef.__delayedRecenter);
            }
			dojo.connect(this, 'onResize', repositionAfterResize);
        },

        // --------------------------------------------------------------------------------------------------------------------------
        // map.centerAtPoint,map.centerAtLatLon
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Simplify centering map, pass in lat/lon or other coordinate system, doesn't require spatial reference
        // Atlernative to: map.centerAt()
        // Example: map.centerAt(new esri.geometry.Point(-81,46));  // spatial ref not required
        // Example: map.centerAtLatLon(-81,46);
        // NOTE: Can be used in onLoad, auto-projects point
        // --------------------------------------------------------------------------------------------------------------------------
        
        "centerAtPoint": function (pt, level) {
            if (!pt || pt.type !== "point")  
                return;
            if (!level) 
                level = this.defaultZoomLevel;

            function centerAndZoomFunc(pt, level, mapRef) {
                // Project
                esri.geometry.geoHelper.autoProject(pt, mapRef.spatialReference, function(geometries) {
                    mapRef.centerAndZoom(geometries[0], level);                
                });
            }

            // Call function
            if (!this.loaded)
                dojo.connect(this, 'onLoad', function() {
                        centerAndZoomFunc(pt, level, this);
                });
            else
                centerAndZoomFunc(pt, level, this);
        },

        "centerAtLatLon": function (lat, lon, level) {
            var pt = new esri.geometry.Point(lon,lat);
            this.centerAtPoint(pt,level);
        },

        // --------------------------------------------------------------------------------------------------------------------------
        // map.centerAtMyLocation,map.findMyLocation
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Simplify centering map at current browser geolocation
        // Atlernative to: navigator.geolocation()
        // Example: map.centerAtMyLocation(map.defaultSymbols.Geolocation, 10);
        // Example: map.findMyLocation(callbackHandler, errorHandler);
        // NOTE: Can be used in onLoad()
        // --------------------------------------------------------------------------------------------------------------------------

        "centerAtMyLocation" : function (geoSymbol, zoomLevel) {
              var mapRef = this;

              function showGeolocation(map2) {
	                if (navigator.geolocation){
			                navigator.geolocation.getCurrentPosition(showLocation, errorHandler);
	                } else {
		                alert("Your browser doesn't support geolocation.");			
	                }
                }

                function showLocation(position) {
	                var pt = new esri.geometry.Point(position.coords.longitude,position.coords.latitude);
	                if (geoSymbol)
                        mapRef.graphics.addPoint(pt, {title:"<b>My Geolocation</b>", content:"Latitude: " + pt.y.toFixed(3) + "</br>Longitude: " + pt.x.toFixed(3), symbol:geoSymbol, attributes:{ "ID": "GEOLOCATION" }});			
	                mapRef.centerAtPoint(pt, zoomLevel);
                }

                function errorHandler(err) {
	                if(err.code == 1) {
		                alert("Error: Access is denied!");
	                } else if ( err.code == 2) {
		                alert("Error: Position is unavailable!");
	                }
                }

                showGeolocation(this);
        },

        "findMyLocation" : function (callbackHandler, errorHandler) {
            function findMyLocationFunc () {
                if (navigator.geolocation){
			            navigator.geolocation.getCurrentPosition(callbackHandler, errorHandler);
	            } else {
		            errorHandler("Your browser doesn't support geolocation.");			
	            }
            }

            // Call function
            if (!this.loaded)
                dojo.connect(this, 'onLoad', function() {
                    findMyLocationFunc();
                });
            else
                findMyLocationFunc();
        },

        // --------------------------------------------------------------------------------------------------------------------------
        // map.findGraphicLayer
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Easy way to find graphicslayers
        // Example: map.findGraphicLayer("mylayer");
        // --------------------------------------------------------------------------------------------------------------------------

        "findGraphicsLayer" : function (layerName) {
            for (var i = 0; i < this.graphicsLayerIds.length; i++) {
                var layer = this.getLayer(mapRef.graphicsLayerIds[i]);
                if (layer.name == layerName) 
                    return layer;
            } 
            return null; 
        }
    });

    /**************************************************************************************************************************/
    /*** Extended esri.layers.GraphicsLayer class ***/
    /**************************************************************************************************************************/
    // Provides simplified functions to work with graphics and info windows.
    // - use options to configure graphic and popups
    // - add point, line and polygon graphics with default symbols
    // - auto configure info window content
    // - assign attributes (IDs)
    // - find or delete graphics by IDs
    // - create graphics with Lat/Lon with no spatial reference, auto-converts spatial references
    // - wire events without dojo
    // Alternative: esri.layers.GraphicsLayer (without esriquickstart.js) 
    //  NOTES: Supports all default esri.layers.GraphicLayer behavior

    // Examples
    // All graphic options:  var options = {title:"my title",content:"<b>My content</b>",symbol:map.defaultSymbols.Point/Line/Polygon,attributes:{"ID","My Tag"}}
    // map.graphics.addPoint(pt, options);  
    // map.graphics.addLine(ptArray, options);  
    // map.graphics.addPolygon(ptArray, options);
    // var graphics = map.graphics.findByAttribute("ID","my attribute tag"});
    // var removed = map.graphics.removebyAttribute("ID","my attribute tag"});
    // map.graphics.moveTo(myGraphic, "top");
    // map.graphics.clearAll(true);  
    // map.graphics.addListener("Clicked", callbackHandler);
    // map.graphics.removeListener("Clicked");

    dojo.extend(esri.layers.GraphicsLayer,
    {
        "_listener": null,
        "_toTop": "top",
        "_toBottom": "bottom",

        "_initialize": function () {
            if (!this._listener)
                this._listener = new esriqs.Listener(this);
        },

        // --------------------------------------------------------------------------------------------------------------------------
        // graphicsLayer.addListener/removeListeners
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Wire events without dojo
        // Atlernative to: dojo.connect()
        // Example: map.graphics.addListener("onClick", callbackHandler);
        // --------------------------------------------------------------------------------------------------------------------------

        "addListener": function (event, handler) {
            this._initialize();
            this._listener.add(event,handler);
        },

        "removeListeners": function (event) {
            this._initialize();
            this._listener.remove(event);
        },

        // --------------------------------------------------------------------------------------------------------------------------
        // graphicsLayer.addPoint, graphicsLayer.addLine, graphicsLayer.addPolygon
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Simplify adding graphics and formatting info windows without dojo callbacks, 
        // takes lat/lon or any other coordinates, works in onLoad(), add attributes
        // Atlernative to: graphics.add(), new geometries, new symbols and infoWindow 
        // Example: map.graphics.addPoint(esri.geometry.Point, {title:"My Title", 
        //                                                          content:"<p>My Point</p>", 
        //                                                          symbol: map.defaultSymbols.Geolocation, 
        //                                                          attributes:"ID,"MYPOINT"});
        // --------------------------------------------------------------------------------------------------------------------------

        "addPoint": function (pt, options) {
            this._initialize();
            var graphicsLayer = this;
            options = options || {};  // Options: symbol,title,content,attributes

            function addPointFunc(pt, options, mapRef) {
                // Project and add to the graphics layer
                //pt = esri.geometry.geoHelper.autoProject(pt,this._map.spatialReference);
                esri.geometry.geoHelper.autoProject(pt, mapRef.spatialReference, function(geometries) {
                    pt = geometries[0];
                    var infoTemplate = new esri.InfoTemplate(options.title, options.content);
                    var graphic;
                    if (options.symbol instanceof esri.symbol.Symbol)
                        graphic = new esri.Graphic(pt, options.symbol, options.attributes, infoTemplate);
                    else
                        graphic = new esri.Graphic(pt, esri.esriDefaultSymbols.Point, options.attributes, infoTemplate);
                    graphicsLayer.add(graphic);
                    graphicsLayer.moveTo(graphic,options.placement);   
                });
            }

            // Call function
            if (!this._map.loaded) {
                this._map.addListener("onLoad", function () {
                    addPointFunc(pt, options, this._map);
                });
            } else
                    addPointFunc(pt, options, this._map);
        },

        "addLine": function (ptsOrPolyline, options) {
            this._initialize();
            var graphicsLayer = this;
            options = options || {};  // Options: symbol,title,content,attributes

            function addLineFunc(ptsOrPolyline, options, mapRef) {
                var polyline;
                if (ptsOrPolyline instanceof Array) {
                    polyline = new esri.geometry.Polyline(ptsOrPolyline[0].spatialReference);
                    polyline.addPath(ptsOrPolyline);
                } else
                    polyline = ptsOrPolyline;

                // Project and add to the graphics layer
                esri.geometry.geoHelper.autoProject(polyline, mapRef.spatialReference, function(geometries) {
                    var pt = polyline.getExtent().getCenter();
                    var infoTemplate = new esri.InfoTemplate(options.title, options.content);
                    var graphic;
                    if (options.symbol instanceof esri.symbol.Symbol)
                        graphic = new esri.Graphic(polyline, options.symbol, options.attributes, infoTemplate);
                    else
                        graphic = new esri.Graphic(polyline, esri.esriDefaultSymbols.Line, options.attributes, infoTemplate);    
                    graphicsLayer.add(graphic);
                    graphicsLayer.moveTo(graphic,options.placement);      
                 });
            }
            
            // Call function
            if (!this._map.loaded) {
                this._map.addListener("onLoad", function () {
                    addLineFunc(ptsOrPolyline, options, this._map);
                });
            } else 
               addLineFunc(ptsOrPolyline, options, this._map);
        },

        "addPolygon": function (ptsOrPolygon, options) {
            this._initialize();
            var graphicsLayer = this;
            options = options || {};  // Options: symbol,title,content,attributes
            
            function addPolygonFunc(ptsOrPolygon, options, mapRef) {
                var polygon;
                if (ptsOrPolygon instanceof Array) {
                    var polygon = new esri.geometry.Polygon(ptsOrPolygon[0].spatialReference);
                    polygon.addRing(pts);
                } else
                    polygon = ptsOrPolygon;

               // Project and add to the graphics layer
                esri.geometry.geoHelper.autoProject(polygon, mapRef.spatialReference, function(geometries) {
                    var pt = polygon.getExtent().getCenter();
                    var infoTemplate = new esri.InfoTemplate(options.title, options.content);
                    var graphic;
                    if (options.symbol instanceof esri.symbol.Symbol)
                        graphic = new esri.Graphic(polygon, options.symbol, options.attributes, infoTemplate);
                    else
                        graphic = new esri.Graphic(polygon, esri.esriDefaultSymbols.Polygon, options.attributes, infoTemplate); 
                    graphicsLayer.add(graphic);
                    graphicsLayer.moveTo(graphic,options.placement);    
                 });
            }

            // Call function
            if (!this._map.loaded) {
                this._map.addListener("onLoad", function () {
                    addPolygonFunc(ptsOrPolygon, options, this._map);
                });
            } else 
                addPolygonFunc(ptsOrPolygon, options, this._map);
        },

        // --------------------------------------------------------------------------------------------------------------------------
        // graphicsLayer.findByAttribute, graphicsLayer.removeByAttribute, graphicsLayer.moveTo
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Make it easy to find, move and delete graphics
        // Example: var graphics = map.graphics.findByAttribute("ID","MYPOINTS");
        // Example: var wasRemoved = map.graphics.removeByAttribute("ID","MYPOINTS");
        // Example: map.graphics.moveTo(top);    // Use "top" or "bottom"
        // --------------------------------------------------------------------------------------------------------------------------
        
        "findByAttribute": function (attribute, value) {
            this._initialize();
            var graphics = this.graphics;
            var graphicsFound = [];

            for (var i = 0; i < graphics.length; i++) {
                var graphic = graphics[i];
                if (graphic.attributes) {
                    if (graphic.attributes.hasOwnProperty(attribute)) {
                        for (var prop in graphic.attributes) {
                            if (graphic.attributes[attribute] == value) {
                                graphicsFound.push(graphics[i]);
                                break;
                            }
                        }
                    }
                }
            }

            return graphicsFound;
        },

        "removeByAttribute": function (attribute, value) {
            this._initialize();
            var graphics = this.graphics;
            var removed = false;

            for (var i = graphics.length - 1; i > -1; i--) {
                var graphic = graphics[i];
                if (graphic.attributes) {
                    if (graphic.attributes.hasOwnProperty(attribute)) {
                        for (var prop in graphic.attributes) {
                            if (graphic.attributes[attribute] == value) {
                                this.remove(graphic);
                                removed = true;
                                break;
                            }
                        }
                    }
                }
            }
            return removed;
        },

        // Move to top or bottom of stack
        "moveTo": function(graphic,placement) {
               if (graphic && placement) {
                   if (placement == this._toTop)
                        graphic.getDojoShape().moveToFront();
                    else if (placement == this._toBottom)
                        graphic.getDojoShape().moveToBack();
               }
        },

        
        // --------------------------------------------------------------------------------------------------------------------------
        // graphicsLayer.clearAll
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Remove all graphics and popups at the same time
        // Example: var graphics = map.graphics.clearAll(true);
        // --------------------------------------------------------------------------------------------------------------------------

        "clearAll": function (hidePopups) {
            this._initialize();
            this.clear();
            if (hidePopups)
                this._map.infoWindow.hide();
        }
    });

	/**************************************************************************************************************************/
    /*** New esriqs.arcgisonline.GeocodeService class ***/
    /**************************************************************************************************************************/
    // Provides a standard methodology for accessing and calling the world ArcGIS Online geocode service (Locator service).
    // - hides URL endpoints
    // - standardize name of each service
    // - provides default service params
    // - standardize input options (all service calls take options parameter)
    // - standardizes geocoding address return values
    // - formats geocode/find search strings
    // - takes Lat/Lon params
    // Alternative: esri.Locator
    // NOTE: Also provides access to default geocode, route and geometry services

    // Examples
    // var geocodeService = new esriqs.arcgisonline.GeocodeService();
	// geocodeService.findPlaces({place:"starbucks", placeType: "coffee shops", searchExtent: ext}, callbackHandler, errorHandler);
	// geocodeService.findAddressFromPoint({mapPoint:pt, matchDistance: 200}, callbackHandler, errorHandler);
	
    dojo.declare("esriqs.arcgisonline.GeocodeService", null,  
    {
		// Geocoding settings
		"defaultSpatialReference": null,
		"defaultPOIType":"businesses",
        "defaultAddressOutFields": ["Loc_name","Addr_Type","Type","Match_addr","Address","AddNum"],
        "defaultMatchDistance": 200,  // Meters
		"_locator": null,
		
		constructor: function () {
            // Default spatial reference is Mercator
            this.defaultSpatialReference = new esri.SpatialReference(102100); 
			this._locator = new esri.tasks.Locator(esriqs.Geoservice.Endpoints().GEOCODE);
			this._locator.setOutSpatialReference(new esri.SpatialReference(this.defaultSpatialReference.wkid));
			this.url = this._locator.url;
		}, 	
		
	   "_formatPlaceQuery": function(options, defaultType) {
			var placeQuery;
			// Set required search options (format query)
			if (options.place)  //Primary keyword  (world-wide if extent is null or confined by extent)
				placeQuery = options.place;  // e.g. Starbucks, San Diego, 100 Beach St, Toronto...
			
			if (options.placeType && options.placeType.match("^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$")) {   // Secondary search type
				var searchAll = (options.placeType == "All" || options.placeType == "all" || options.placeType == "ALL");
				if (!options.place) {
					if (searchAll)
						//placeQuery = options.placeType + " in " + options.place;   //e.g. Coffee Shops in San Diego
						placeQuery = options.placeType = defaultType;  // override default null search
					else
						placeQuery = options.placeType;
				} else {
					if (!searchAll)
						placeQuery = placeQuery + " and " + options.placeType;
				 }
			}
			return placeQuery;
        },
		
		// Provide access to default Locator functions
		"url": null,
		
		setOutSpatialReference: function(spatialReference) {
			this._locator.setOutSpatialReference(spatialReference);
		},

		// Access to default esri task
		"getDefaultService": function () {
			return this._locator;
		},	
	
		// --------------------------------------------------------------------------------------------------------------------------
        // esriqs.arcgisonline.GeocodeService.findPlaces (forward geocoding and finding places)
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Simple name, standardize input options and output address format, formats user input query
        // Atlernative to: Locator.addressToLocations(options, callbackHandler, errorHandler)
        // Example: geoServices.findPlaces({place:"starbucks", placeType:"coffee shops", searchExtent: ext}, handler, errorHandler);
        // New options: { place: "380 New York", 
        //            placeType: "Coffee Shops", 
        //            searchExtent: ext, 
        //            outSR: spatialRef, 
        //            outFields: ["Address","Loc_type"] }
        // DEFAULTS to "businesses" when null query and type are null
        // NOTE: 
        // --------------------------------------------------------------------------------------------------------------------------

        "findPlaces": function (placeOptions, callbackHandler, errorHandler) {
            var options = placeOptions || {}; 
            var placeQuery;

            // Override default options if params passed in
            options.outSR = (options.outSR ? options.outSR : this.defaultSpatialReference);
            this.setOutSpatialReference(options.outSR);
            options.outFields = (options.outFields ? options.outFields : this.defaultAddressOutFields);  // TODO - merge
            // Get Query
            placeQuery = this._formatPlaceQuery(options,"businesses");

            // Search options
            var addressPackage = { "SingleLine": placeQuery };
            var geocodeOptions = {
                address: addressPackage,
                outFields: options.outFields,
                searchExtent: options.searchExtent,
                outSR: options.outSR
            };

            var geocodeResultsFunction = function (geocodeResults) {
                var results = [];
                // Standardize results before sending them back
                dojo.forEach(geocodeResults, function (candidate) {
                    results.push({
                        rawAddress: candidate,  // FOR TEST ONLY
                        address: candidate.address,
                        addressType: candidate.attributes.Addr_Type,
                        placeType: candidate.attributes.Type,
                        locatorType: candidate.attributes.Loc_name,
                        score: candidate.score,
                        point: candidate.location
                    });
                });

                callbackHandler(results);
            };
            // FOR TEST ONLY
            console.log("Geocode Query: " + placeQuery + " Extent: " + options.searchExtent);  

			this._locator.addressToLocations(geocodeOptions, geocodeResultsFunction, errorHandler);
        },

        // --------------------------------------------------------------------------------------------------------------------------
        // esriqs.arcgisonline.GeocodeService.findAddressFromPoint (reverse geocoding)
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Simple name, standardize input options and output address
        // Alternative to: Locator.pointToAddress(mapPoint, callbackHandler, errorHandler)
        // Example: geoServices.findAddressFromPoint({mapPoint:pt,matchDistance: 200}, handler, errorHandler);
        // New options: { mapPoint: pt, 
        //          matchDistance: 200 }
        // DEFAULTS to 200m search radius
        // NOTE: Reverse geocode only ever returns one result!  
        // --------------------------------------------------------------------------------------------------------------------------

        "findAddressFromPoint": function (options, callbackHandler, errorHandler) {
            options = options || {};
            var results = [];
            // Set required reverse geocoding options
            var mapPoint = options.mapPoint;  // Required

            // Override default options if passed in
            var matchDistance = (options.matchDistance ? options.matchDistance : this.defaultMatchDistance);

            var geocodeResultsFunction = function (geocodeResults) {
                // Standardize address before returning results
                function formatAddress(addressIn) {
                    var address = addressIn.Address;
                    var city = addressIn.Admin1;
                    var state = addressIn.Admin2;
                    //var country = addressIn.Admin3;
                    var zip = addressIn.Postal;
                    var country = addressIn.CountryCode;

                    var str = "";
                    if (address)
                        str = address;
                    if (city)
                        str = str + (address ? ", " : "") + city;
                    if (state)
                        str = str + (city ? ", " : "") + state;
                    if (zip)
                        str = str + (state ? ", " : "") + zip;
                    if (country)
                        str = str + (zip ? ", " : "") + country;

                    return str;
                }

                // We only get one result back ever
                if (geocodeResults.constructor == Array) {
                    dojo.forEach(geocodeResults, function (candidate) {  
                        results.push({
                            rawAddress: candidate.address,  // FOR TEST ONLY
                            address: formatAddress(candidate.address),
                            score: candidate.score,
                            point: candidate.location,
                            addressType: null,
                            placeType: null,
                            locatorType: candidate.address.Loc_name
                        });
                    });
                } else {
                    results.push({
                        rawAddress: geocodeResults.address,  // TEST ONLY
                        address: formatAddress(geocodeResults.address),
                        score: geocodeResults.score,
                        point: geocodeResults.location,
                        addressType: null,
                        placeType: null,
                        locatorType: geocodeResults.address.Loc_name
                    });
                }

                callbackHandler(results);
            }

            var convertFunc = function (address) {
                return address.Address + " " + address.City + " " + address.Country + " " + address.State + " " + address.Zip4;
            }

            this._locator.locationToAddress(mapPoint, matchDistance, geocodeResultsFunction, errorHandler);
        },
	});
	
	/**************************************************************************************************************************/
    /*** New esriqs.arcgisonline.RouteService class ***/
    /**************************************************************************************************************************/
    // Provide standardized methodology to access ArcGIS Online Routing service, simplify getting directions and standardize and input/output values.
    // - hides URL endpoints
    // - standardize name of each service
    // - provides default service params
    // - standardizes input options (all service calls take options parameter)
    // Alternative: esri.tasks.RouteTask
    // NOTE: Also provides access to default functions

    // Examples
	// var routeService = new esriqs.arcgisonline.routeService();
    // routeService.getDirections({stops: ptsArray}, handler, errorHandler);
	
    dojo.declare("esriqs.arcgisonline.RouteService", null,  
    {
		// Routing settings
		"defaultSpatialReference": null,
        "defaultRouteRoutesReturned": false,
        "defaultRouteDirectionsReturned": true,
        "defaultRouteLengthUnits": esri.Units.MILES,
		"_routeTask": null,
		
		constructor: function () {
            // Default spatial reference is Mercator
            this.defaultSpatialReference = new esri.SpatialReference(102100); 
			this._routeTask = new esri.tasks.RouteTask(esriqs.Geoservice.Endpoints().ROUTE);
			this.url = this._routeTask.url;
		}, 	
		
		// Access to default esri task
		"getDefaultService": function () {
			return this._routeTask;
		},
		
		// --------------------------------------------------------------------------------------------------------------------------
        // esriqs.arcgisonline.routeService.getDirections
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Simple name, make it easy to get directions, standardize options and input/output for routing
        // Alternative to: RouteTask.solve(params, callbackHandler, errorHandler)
        // Example: geoServices.getDirections({stops: ptsArray}, handler, errorHandler);
        // Options: Supports all default options plus { stops: ptsArray }
        // DEFAULTS to returning routes
        // NOTE: Reverse geocode only ever returns one result!  
        // --------------------------------------------------------------------------------------------------------------------------

        "getDirections": function (options, callbackHandler, errorHandler) {
            options = options || {};

            // Defaults
            var params = new esri.tasks.RouteParameters();
            params.stops = new esri.tasks.FeatureSet();

            // Override defaults with user options
            params.returnRoutes = (options.returnRoutes === true ? true : this.defaultRouteRoutesReturned);
            params.returnDirections = (options.returnDirections === true ? true : this.defaultRouteDirectionsReturned);
            params.directionLengthUnits = (options.directionsLengthUnits ? options.directionsLengthUnits : this.defaultRouteLengthUnits);
            params.outSpatialReference = (options.outSpatialReference ? options.outSpatialReference : this.defaultSpatialReference);

            // Add the starting location
            params.stops.features = [];  // clear
            
            for (var i = 0; i < options.stops.length; i++) {
                var pt = options.stops[i];
                var name = "Stop";
                if (i == 0)
                    name = "Start";
                else if (i == options.stops.length - 1)
                    name = "Finish";

                //pt = esri.geometry.geoHelper.autoProject(pt, params.outSpatialReference);  // TODO - necessary?
                var graphic = new esri.Graphic(pt).setAttributes({ Name: name });
                params.stops.features[i] = graphic;  // Add
            }

            var routeResultsFunction = function (routeResults) {
                callbackHandler(routeResults);
            }

            // Kick off the routing service
            this._routeTask.solve(params, routeResultsFunction, errorHandler);
        }	
	});
	
	/**************************************************************************************************************************/
    /*** New esriqs.arcgisonline.GeometryService class ***/
    /**************************************************************************************************************************/
    // Provide a simple way to get a search circle. Sandardize and input/output values.
    // Alternative: esri.tasks.GeometryService
    // NOTE: Also provides access to default geometry service task

    // Examples
	// var geometryService = new esriqs.arcgisonline.GeometryService();
    // geometryService.getCircle({point: pt, distance: "500", units: esri.tasks.GeometryService.UNIT_STATUTE_MILE}, handler, errorHandler);
	
	dojo.declare("esriqs.arcgisonline.GeometryService", null,
    {
		// Routing settings
		"defaultSpatialReference": null,
		"defaultUnits": esri.tasks.GeometryService.UNIT_STATUTE_MILE,
		"_geometryService": null,
		
		constructor: function () {
            // Default spatial reference is Mercator
            this.defaultSpatialReference = new esri.SpatialReference(102100); 
			this._geometryService = new esri.tasks.GeometryService(esriqs.Geoservice.Endpoints().GEOMETRY);
		}, 	
		
		// Access to default esri task
		"getDefaultService": function () {
			return this._geometryService;
		},

        // --------------------------------------------------------------------------------------------------------------------------
        // geoService.getCircle (circular polygon geometry)
        // --------------------------------------------------------------------------------------------------------------------------
        // Purpose: Simplify getting a search buffer (area)
        // Alternative to: GeometryService.buffer()
        // Example: geoServices.getCircle({point:mapPoint,distance:10});
        // Options:
        // DEFAULTS to statute miles
        // --------------------------------------------------------------------------------------------------------------------------

        "getCircle": function (options, callBackHandler, errorHandler) {
			options = options || {};

            var distance = options.distance ? options.distance : 1;
            var point = options.point ? options.point : new esri.geometry.Point(0,0);
            var units = options.units ? options.units : this.defaultUnits;
            var outSR = options.outSR ? options.outSR : this.defaultSpatialReference;

            var params = new esri.tasks.BufferParameters();
            params.distances = [distance];
            params.geometries = [point];
            params.unit = units;
            params.outSpatialReference = outSR;

            this._geometryService.buffer(params, callBackHandler, errorHandler);
        }
	});
	
    /**************************************************************************************************************************/
     /*** Extended esri.geometry.Point class ***/
    /**************************************************************************************************************************/
    // Provides access and conversion methods to get lat/lon for all points

    // Example:
    // pt.getLatitude(5);
    // pt.getLongitude(5);

    dojo.declare("esri.geometry.Point", esri.geometry.Point,
    {
        "_lat":0,
        "_lon":0,
        "_oldx":null,
        "_oldy":null,
        "_decimals": 0,
        "_defaultDecimals": 10,
        "_isDirty":true,

        constructor: function () {
        },

        "_checkDirty": function(decimals) {
            this._isDirty = (this.x != this._oldx || this.y != this._oldy || decimals != this._decimals) ? true : false;
        },

        // Optimized coordinate conversion upon request
        "_setLatLon": function(decimals) {
            decimals = (decimals && (typeof (123)) ? decimals : this._defaultDecimals);
            this._checkDirty(decimals);
            var ptRef = this;
            if (this._isDirty) {
                esri.geometry.geoHelper.autoProject(this, new esri.SpatialReference(4326), function (geometries) {
                    if (geometries && geometries.length > 0) {
                        var pt = geometries[0];
                        ptRef._lon = pt.x.toFixed(decimals);
                        ptRef._lat = pt.y.toFixed(decimals);
                        ptRef._oldx = ptRef.x;
                        ptRef._oldy = ptRef.y;
                        ptRef._isDirty = false;
                    }
                });    
            }
        },

        // Return latitude
        "getLatitude": function (decimals) {
            this._setLatLon(decimals);
            return this._lat;
        },

        // Return longitude
        "getLongitude": function (decimals) {    
            this._setLatLon(decimals);
            return this._lon;
        }
    });


    /**************************************************************************************************************************/
    /*** GeoHelper Class***/
    /**************************************************************************************************************************/
    // Helper class to detect lat-lon and mercator values and convert back and forth.
    
    // Examples
    // autoProject(geom, outSR, callbackFunc)
    // convertToMercator(lon,lat);
    // convertToGrographic(x,y);
    // isLatLon();

    dojo.declare("esriqs.GeoHelper", null, {

        "_mercatorSR": null,
        "_wgs84SR": null,
		"_geometryService": null,
        
        constructor: function () {
            this._init();  
        },

        _init: function () {
            this._mercatorSR = new esri.SpatialReference(102100);
            this._wgs84SR = new esri.SpatialReference(4326);
			this._geometryService = new esriqs.arcgisonline.GeometryService().getDefaultService();
        },

        autoProject: function(geom, outSR, callbackHandle) {
			this._init();
            
			// Check valid point
            if (!geom || !outSR) {
               console.log("Error auto projecting point. Input geometry or spatial reference is null.");
               return;
            }

            var outGeom;
            var projectHandle;
            
            function project(geom, geometryService) {
                var params = new esri.tasks.ProjectParameters();
                params.geometries = [geom];
                params.outSR = outSR;
				projectHandle = geometryService.project(params,callbackHandle);
            }

            // Set spatialreference if missing
            if (!geom.spatialReference) {
                var pt;
                if (geom.type == "point") 
                    pt = geom;
                else if (geom.type == "multipoint")
                    pt = geom.getPoint(0);
                else if ( geom.type == "polygon" || geom.type == "polyline")
                    pt = geom.getPoint(0,0);
                else // Extent
                    pt = geom.getCenter();
                if(this.isLatLon(pt))
                    geom.spatialReference = this._wgs84SR; // Add SR84
                else
                    geom.spatialReference = new esri.SpatialReference();  // Empty
            }

            // Project point if necessary
            // Quick projection (sync)
            if (geom.spatialReference.wkid == this._wgs84SR.wkid && outSR.wkid == this._mercatorSR.wkid)
                callbackHandle([esri.geometry.geographicToWebMercator(geom)]);  
            else if (geom.spatialReference.wkid == this._mercatorSR.wkid && outSR.wkid == this._wgs84SR.wkid)
                callbackHandle([esri.geometry.webMercatorToGeographic(geom)]);  
            // No projection necessary
            else if (geom.spatialReference.wkid == outSR.wkid)
                callbackHandle([geom]);
            // Project (async)
            else
                project(geom,this._geometryService); 

            var done = true;
        },

        convertToWebMercator: function (lat, lon) {
            lat = this.checkValue(lat);
            lon = this.checkValue(lon);
            var wgs84Pt = new esri.geometry.Point(lon, lat, { wkid: 4326 });
            return esri.geometry.geographicToWebMercator(wgs84Pt);
        },

        convertToGeographic: function (x, y) {
            lon = this.checkValue(x);
            lat = this.checkValue(y);
            var mercator = new esri.geometry.Point(x, y, { wkid: 102100 });
            return esri.geometry.webMercatorToGeographic(mercator);
        },

        checkValue: function (val) {
            if (!val || (!typeof (123)))
                return 0;
            else
                return val;
        },

        getLatLonPoint: function (pt) {
            if (this.isLatLon(pt)) {
                return new esri.geometry.Point(pt.x, pt.y, { wkid: 4326 });
            } else {
                return this.convertToGeographic(pt);
            }
        },

        isLatLon: function (pt) {
            if (!pt)
                return 0;

            var latLng = ((pt.x > -180 && pt.x < 180) && (pt.y > -90 && pt.y < 90))
            return latLng;
        }
    }),

    /**************************************************************************************************************************/
    /*** Listener class***/
    // Use to connect and disconnect from any object events without using dojo

     dojo.declare("esriqs.Listener", null, {

        _connections: null,
        _obj: null,

          constructor: function (obj) {
            this._obj = obj;
        },

        // Event Handler
        "add": function (event, handler) {
            if (!this._connections)
                this._connections = new Array();
            var handle = dojo.connect(this._obj, event, handler);
            this._connections.push({ "eventName": event, "handle": handle });
        },

        "remove": function (event) {
            if (!this._connections || !event) return;
            // for (var i = 0; i < this._connections.length; i++) 
            for (var i = this._connections.length - 1; i > -1; i--) {
                var obj = this._connections[i];
                if (obj) {
                    if (obj.eventName == event) {
                        dojo.disconnect(obj.handle);
                        delete this._connections[i];
                    }
                }
            }
        },
    });

    /**************************************************************************************************************************/
    // Esri namespace Global Exensions 
	
	dojo.declare("esri.arcgisonline", null, {
		"basemaps": new esriqs.DefaultBasemapTypes()
	});

	esri.arcgisonline.basemaps = new esri.arcgisonline().basemaps;
    esri.esriDefaultSymbols = new esriqs.DefaultSymbols();
    esri.esriDefaultGeoserviceEndpoints = new esriqs.Geoservice.Endpoints();
    esri.geometry.geoHelper = new esriqs.GeoHelper();  

// End dojo.ready()
});

