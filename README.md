WCAG basic-viewer-template
=====================
*WCAG Basic Viewer*  is a configurable application template used to display a web map with a specified set of commonly used tools and options. 
This template includes many WCAG 2.0 A, AA and AAA capabilities, which serves as a starting point for developers building fully complaint apps or is an example of WCAG apps.

![Screen Shot](https://github.com/EsriCanada/WCAG-BasicViewer/blob/master/WCAGViewer.png)

[View it live] (http://apps.esri.ca/templates/WCAGViewer/index.html?appid=877de1d2f9e24976a0fa612e547065ee)

#Features
The template can be configured using the following options:

- **Map:** Choose the web map used in your application.
- **Color Scheme:** Choose a color scheme for the application.
- **Show Title:** Choose whether to include an application title. 
- **Title Text:** The application title. The default title is the web map name.
- **Logo:** Choose a custom logo for your application.
- **Overview Map:** Display a retractable overview map to add context for panning and zooming.
- **Legend:** Display a legend for map layers. *
- **Details:** Display the web map item description. *
- **Editor:** Allows users to interactively create, modify, or delete features in editable layers. *
- **Print:** Enables printing the map at the current extent. It can be configured to include a legend and supports different layout options.
- **Layer List:** Enables toggling the visibility of operational layers within the web map. *
- **Basemaps:** Enables the display of the basemap gallery. 
- **Bookmarks:** Enables the use of web map bookmarks for navigation. *
- **Measure:** Enables measure tool for interactive area, length, and point measurement.
- **Share:** Allows users to share the application with others via email, Twitter, or Facebook.
- **Search:** Displays the Search box to enable navigation to addresses and places. 


*These options will appear in the application when the web map has properties or layers that support them.



# Instructions

## Instructions

1. Download and unzip the .zip file or clone the repository.
2. Web-enable the directory.
3. Access the .html page.
4. Start writing your template!

[New to Github? Get started here.](https://github.com/)

## Deploying

1. To deploy this application, download the template from Portal/ArcGIS Online and unzip it.
2. Copy the unzipped folder containing the web app template files, such as index.html, to your web server. You can rename the folder to change the URL through which users will access the application. By default the URL to the app will be `http://<Your Web Server>/<app folder name>/index.html`
3. Change the sharing host, found in defaults.js inside the config folder for the application, to the sharing URL for ArcGIS Online or Portal. For ArcGIS Online users, keep the default value of www.arcgis.com or specify the name of your organization.
  - ArcGIS Online Example:  `"sharinghost": location.protocol + "//" + “<your organization name>.maps.arcgis.com`
  - Portal Example where `arcgis` is the name of the Web Adaptor: `"sharinghost": location.protocol + "//" + "webadaptor.domain.com/arcgis"`
4. If you are using Portal or a local install of the ArcGIS API for JavaScript, change all references to the ArcGIS API for JavaScript in index.html to refer to your local copy of the API. Search for the references containing `"//js.arcgis.com/3.13"` and replace this portion of the reference with the url to your local install.
  - For example: `"//webadaptor.domain.com/arcgis/jsapi/jsapi"` where `arcgis` is the name of your Web Adaptor.
5. Copy a map or group ID from Portal/ArcGIS Online and replace the default web map ID in the application’s default.js file. You can now run the application on your web server or customize the application further.

**Note:** If your application edits features in a feature service, contains secure services or web maps that aren't shared publicly, or generate requests that exceed 200 characters, you may need to set up and use a proxy page. Common situations where you may exceed the URL length are using complex polygons as input to a task or specifying a spatial reference using well-known text (WKT). For details on installing and configuring a proxy page see [Using the proxy](https://developers.arcgis.com/javascript/jshelp/ags_proxy.html). If you do not have an Internet connection, you will need to access and deploy the ArcGIS API for JavaScript documentation from [developers.arcgis.com](https://developers.arcgis.com/).

For addtional customization options view the [wiki](https://github.com/Esri/Viewer/wiki/Viewer-Template-Wiki). 

# Requirements

- Notepad or HTML editor
- Some background with HTML, CSS and JavaScript
- Experience with the ArcGIS API for JavaScript is helpful. 

# Resources

- [ArcGIS API for JavaScript Resource Center](http://help.arcgis.com/en/webapi/javascript/arcgis/index.html)
- [Loading a locally-defined webmap, instead of from AGOL](LocalWebmap.md)

#Issues

Found a bug or want to request a new feature? Please let us know by submitting an issue. 

# Contributing
Anyone and everyone is welcome to contribute. 

# Aknowldgements

- Mapping and Charting Establishment (MCE) for providing ressources for some of the testing, feedback, and bug fixes.

# Licensing 

Copyright 2012 Esri

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

A copy of the license is available in the repository's license.txt file.
[](Esri Tags: ArcGIS Online Web Application Templates) 
[](Esri Language: JavaScript)
