define([
    "dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on",
    "dojo/query", "esri/toolbars/navigation", "dijit/registry",
    "esri/dijit/HomeButton", "esri/dijit/LocateButton", 
    "esri/symbols/SimpleLineSymbol", "esri/Color",
    //"dojo/text!application/SuperNavigator/templates/SuperNavigator.html", 
    // "dojo/i18n!application/nls",
    //SuperNavigator",
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", 
    "dojo/dom-construct", "dojo/_base/event", 
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on, 
        query, Navigation, registry,
        HomeButton, LocateButton, 
        SimpleLineSymbol, Color,
        //SuperNavigatorTemplate, 
        // i18n,
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
            cursorColor:"white",
            // newIcons:'',
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
    
        _init: function () {
            //if(!dom.byId("navZoomIn")) return;

            domStyle.set(dom.byId('mapDiv_zoom_slider'), 'background-color', 'transparent');
            dojo.empty(this.navToolBar);

            var cursorNav = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            domAttr.set(cursorNav, "id", "mapSuperCursor");
            domStyle.set(cursorNav,"position","absolute");
            domStyle.set(cursorNav,"transform","translate(100px, 100px)");

            var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            domAttr.set(circle,"cx", "20");
            domAttr.set(circle,"cy", "20");
            domAttr.set(circle,"r", "15");
            domAttr.set(circle,"stroke", "red");
            domAttr.set(circle,"fill", "white");

            domConstruct.place(circle,cursorNav);
            domConstruct.place(cursorNav,'mapDiv_layers');

        }

    });

    if (has("extend-esri")) {
        lang.setObject("dijit.SuperNavigator", Widget, esriNS);
    }
    return Widget;
});