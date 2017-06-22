define([
    "dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on", "dojo/mouse", "dijit/focus",
    "dojo/query", "esri/toolbars/navigation", "dijit/registry",
    "esri/dijit/HomeButton", "esri/dijit/LocateButton", 
    "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/symbols/SimpleFillSymbol", 
    "esri/graphic", "esri/geometry/Point", "esri/geometry/ScreenPoint",
    "esri/geometry/Circle",
    "esri/layers/FeatureLayer", "esri/tasks/query", //"esri/tasks/QueryTask",
    //"dojo/text!application/SuperNavigator/templates/SuperNavigator.html", 
    // "dojo/i18n!application/nls",
    //SuperNavigator",
    "dojox/gfx", // "dojox/gfx/fx",
    "dojo/Deferred", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", 
    "dojo/dom-construct", "dojo/_base/event", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on, mouse, focusUtil,
        query, Navigation, registry,
        HomeButton, LocateButton, 
        SimpleLineSymbol, Color, SimpleFillSymbol,
        Graphic, Point, ScreenPoint,
        Circle,
        FeatureLayer, Query, //QueryTask,
        //SuperNavigatorTemplate, 
        // i18n,
        gfx, // gfxFx,
        Deferred,
        domClass, domAttr, domStyle, 
        domConstruct, event
    ) {
    var Widget = declare("esri.dijit.SuperNavigator", [
        _WidgetBase, 
        // _TemplatedMixin, 
        Evented], {
        // templateString: SuperNavigator,

        options: {
            map: null,
            navToolBar:null,
            cursorColor:"black",
            cursorFocusColor:"red",
            zoomColor:'red',
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);
            // this._i18n = i18n;
            // this.domNode = srcRefNode;

            this.set("map", defaults.map);
            this.set("navToolBar", defaults.navToolBar);
            this.set("zoomColor", defaults.zoomColor);
            this.set("cursorColor", defaults.cursorColor);            
            this.set("cursorFocusColor", defaults.cursorFocusColor);            
            },

        startup: function () {
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function () {
                    this._init();
                }));
            }
        },

        cursorNav: null,
        cursor: null,
        cursorPos: null,
    
        _init: function () {
            //if(!dom.byId("navZoomIn")) return;

            // domStyle.set(dom.byId('mapDiv_zoom_slider'), 'background-color', 'transparent');
            dojo.empty(this.navToolBar);

            var m = this.cursorToCenter();
            // dom.byId('mapDiv').getBoundingClientRect();
            // this.cursorPos = new ScreenPoint(((m.right-m.left)/2), ((m.bottom-m.top)/2));

            // https://dojotoolkit.org/documentation/tutorials/1.10/gfx/
            var mapSuperCursor = domConstruct.create('div', {
                id: 'mapSuperCursor',
                style:'position:absolute;',
                // tabindex: 0
            }, 'mapDiv_layers');
            this.cursorNav = gfx.createSurface("mapSuperCursor", 40, 40);//m.right-m.left, m.bottom-m.top);
            this.cursor = this.cursorNav.createGroup();
            var circle = this.cursor.createCircle({cx:20, cy:20, r:7}).setFill("transparent").setStroke(this.cursorFocusColor);
            var path = this.cursor.createPath("M20 0 L20 19 M20 21 L20 40 M0 20 L19 20 M21 20 L40 20").setStroke({color:"black", width:2});

            domStyle.set('mapSuperCursor', 'left', (this.cursorPos.x-20)+'px');
            domStyle.set('mapSuperCursor', 'top', (this.cursorPos.y-20)+'px');
            //this.cursor.setTransform([gfx.matrix.translate(this.cursorPos.x-20, (this.cursorPos.y-20) )]);  

            this.map.onResize = lang.hitch(this, function(ev) {
                var m = dom.byId('mapDiv').getBoundingClientRect();
                this.cursorPos = {x: ((m.right-m.left)/2), y: ((m.bottom-m.top)/2)};
                domStyle.set('mapSuperCursor', 'left', (this.cursorPos.x-20)+'px');
                domStyle.set('mapSuperCursor', 'top', (this.cursorPos.y-20)+'px');
                // console.log('map resize',ev);
            });

            on(this.map.infoWindow, 'show', lang.hitch(this, function() {
                if(this.queryZone) {
                    this.map.graphics.add(this.queryZone);
                }
                query('.titleButton').forEach(function(btn){
                    domAttr.set(btn,'tabindex', 0);
                    on(btn,'keypress', lang.hitch(this, function(ev) {
                        console.log(ev);
                        if(ev.keyCode == 13) {
                            ev.srcElement.click();
                        }
                    }));
                });
                query('.sizer.content').forEach(function(content){
                    domAttr.set(content,'tabindex', 0);
                });
            }));
            on(this.map.infoWindow, 'hide', lang.hitch(this, function() {
                if(this.queryZone) {
                    this.map.graphics.remove(this.queryZone);
                }
            }));

            on(this.map.infoWindow, "selection-change", function(ev) {
                // console.log(ev);
                // query('.sizer.content').forEach(function(content){
                //     domAttr.set(content,'tabindex', 0);
                // });
            });
        },

        cursorToCenter:function() {
            var m = dom.byId('mapDiv').getBoundingClientRect();
            this.cursorPos = new ScreenPoint(((m.right-m.left)/2), ((m.bottom-m.top)/2));
            return m;
        },

        cursorScroll:function(dx, dy) {
            var deferred = new Deferred();

            this.cursorPos.x += dx;
            this.cursorPos.y += dy;
            var m = dom.byId('mapDiv').getBoundingClientRect();
            if(this.cursorPos.x < 20) {
                this.map.centerAt(this.map.toMap(this.cursorPos)).then(lang.hitch(this, function(){
                    this.cursorToCenter();
                    domStyle.set('mapSuperCursor', 'left', (this.cursorPos.x-20)+'px');
                    domStyle.set('mapSuperCursor', 'top', (this.cursorPos.y-20)+'px');
                    deferred.resolve(this.cursorPos);
                }));
            }
            else {
                domStyle.set('mapSuperCursor', 'left', (this.cursorPos.x-20)+'px');
                domStyle.set('mapSuperCursor', 'top', (this.cursorPos.y-20)+'px');
                deferred.resolve(this.cursorPos);
            }
            return deferred.promise;
        },

        queryZone : null,

        getFeaturesAtPoint: function(mapPoint, extendRadius, allLayers, callback) {

            this.features = [];
            this.callback = callback;
            var tasks = [];
            var layers = allLayers.filter(function (l) { return l.hasOwnProperty("url");});

            var w = this.map.extent.getWidth()/75;
            if(extendRadius) w *= 10;

            var circleSymb = new SimpleFillSymbol(
                  SimpleFillSymbol.STYLE_SOLID,
                  new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([255, 0, 0]),
                    1
                  ), new Color([255, 0, 0, 0.25])
            );

            for(var l = 0; l<layers.length; l++) {
                var circle = new Circle({
                    center: mapPoint,
                    geodesic: false,
                    radius: w,
                  });
                var q = new Query();
                q.outFields = ["*"];                    
                q.where = "1=1";
                q.geometry = circle;

                if(this.queryZone) {
                    this.map.graphics.remove(this.queryZone);
                }

                this.queryZone = new Graphic(circle, circleSymb);
                this.map.graphics.add(this.queryZone);

                q.spatialRelationship = "esriSpatialRelIntersects";
                q.returnGeometry = true;

                layer = layers[l];

                layer.layerObject.selectFeatures(
                    q, FeatureLayer.SELECTION_NEW, 
                    lang.hitch(this, function(results) {
                        if(this.callback)
                            this.callback(results);
                        }
                    )
                );
            }
            return this.features;
        },

        showPopup: function(shiftKey, layers) {
            var center = this.map.toMap(this.cursorPos);
            var features = [];
            this.getFeaturesAtPoint(
                center, shiftKey, layers, 
                lang.hitch(this, function(results){
                    results.forEach(function(feature) { 
                        if(feature.getLayer().visible && feature.getLayer().visibleAtMapScale)
                            features.push(feature);
                    });

                    // this.map.infoWindow.hide();
                    // this.map.infoWindow.clearFeatures();

                    // this.map.centerAt(center).then(lang.hitch(this, function() {
                        this.map.infoWindow.setFeatures(features);
                        this.map.infoWindow.show(center);
                    // }));
                })
            );
        }

    });

    if (has("extend-esri")) {
        lang.setObject("dijit.SuperNavigator", Widget, esriNS);
    }
    return Widget;
});