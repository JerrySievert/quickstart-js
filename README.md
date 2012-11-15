# Quick Start JS

An ArcGIS Javscript library and samples to help you build web mapping applications quickly.  The library simplifies a number of basic tasks such as loading and centering basemaps, and provides higher-level calls to a number of ArcGIS Online services such as geocoding and routing.  No dojo or GIS knowledge required.  Bootstrap is used to layout and style the applications.  

[View live app here](http://edn1.esri.com/quickstartjs/demo/landingpage.html)

* Source: [https://github.com/Esri/quickstart-js](https://github.com/Esri/quickstart-js)
* Homepage: [http://esri.github.com/](http://esri.github.com/)
* Esri: [@esri](http://twitter.com/esri)
* Blog: [ArcGIS](http://blogs.esri.com/esri/arcgis/)

## Features
* Simplifies development with the ArcGIS JavaScript API.
* hook map events without dojo.connect
* auto-wire onLoad() callbacks for all graphics and zoom functions
* new options in contructor to center, zoom and set basemap
* easily access and swap ArcGIS Online basemap layers (without REST endpoints) 
* use of lat/lon coordinates instead of extents
* no spatial references required, auto-projects geometries
* easily add points, lines and polygons graphics with custom popups 
* easier access to ArcGIS Online geoservices 

* Current samples: Basemaps, Geolocation, Graphics, Places, Directions, Cloud, [yours!]...

## Instructions

1. Download and unzip the .zip file.
2. Add the js library in your .html file after the ArcGIS reference.

        <script type="text/javascript" src="http://serverapi.arcgisonline.com/jsapi/arcgis/?v=3.2compact"></script>
        <script type="text/javascript" src="../src/esriquickstart.js"></script>

3. Go!

## Requirements

* Notepad or HTML editor
* A little background with Javascript
* Experience with the [ArcGIS Javascript API](http://www.esri.com/) would help.
* If you want to get fancy, check out [Bootstrap](http://twitter.github.com/bootstrap) to make your app look pretty and be responsive.

## Resources

* [ArcGIS for JavaScript API Reference](http://help.arcgis.com/en/webapi/javascript/arcgis/help/jsapi_start.htm)
* [ArcGIS for JavaScript API Samples](http://help.arcgis.com/en/webapi/javascript/arcgis/help/jssamples_start.htm)
* [ArcGIS for JavaScript API Resource Center](http://help.arcgis.com/en/webapi/javascript/arcgis/index.html)

## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Contributing

Anyone and everyone is welcome to contribute. 

## Licensing
Copyright (c) 2012 Esri. All Rights Reserved.
Released under Apache License Version 2.0, January 2004