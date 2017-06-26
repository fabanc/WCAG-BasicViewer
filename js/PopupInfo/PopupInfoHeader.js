define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/registry",
    "dojo/on", 
    "dojo/Deferred", "dojo/query", 
    "dojo/text!application/PopupInfo/templates/PopupInfoHeader.html", 
    "dojo/dom", "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/parser", "dojo/ready",
    "dijit/layout/ContentPane",    
    "dojo/string", 
    "dojo/i18n!application/nls/PopupInfo",
    "esri/domUtils",
    "esri/dijit/Popup",
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, esriNS,
        _WidgetBase, _TemplatedMixin, registry,
        on, 
        Deferred, query,
        PopupInfoHeaderTemplate, 
        dom, domClass, domAttr, domStyle, domConstruct, event, 
        parser, ready,
        ContentPane,
        string,
        i18n,
        domUtils,
        Popup
    ) {

    // ready(function(){
    //     // Call the parser manually so it runs after our widget is defined, and page has finished loading
    //     parser.parse();
    // });

    var Widget = declare("esri.dijit.PopupInfoHeader", [_WidgetBase, _TemplatedMixin, Evented], {
        templateString: PopupInfoHeaderTemplate,

        options: {
            map: null,
            toolbar: null, 
            header: 'pageHeader_infoPanel',
            popupInfo: null,
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);
            this.domNode = srcRefNode;
            this.widgetsInTemplate = true;

            this.map = defaults.map;
            this.toolbar = defaults.toolbar;
            this._i18n = i18n;
            this.headerNode = dom.byId(defaults.header);
            this.popupInfo = defaults.popupInfo;
        },

        startup: function () {
            if (!this.map || !this.toolbar) {
                this.destroy();
                console.log("PopupInfo: map or toolbar required");
            }
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function () {
                    this._init();
                }));
            }
        },

//https://developers.arcgis.com/javascript/3/sandbox/sandbox.html?sample=popup_sidepanel

        total:0,
        _setTotalAttr: { node: "totalNode", type: "innerHTML" },

        _init: function () {

            this.loaded = true;

            var popup = this.map.infoWindow;

            var buttons = query(".popupInfoButton");
            buttons.forEach(function (btn) {
                on(btn,'keydown', lang.hitch(this, function(ev) {
                    switch(ev.keyCode) {
                        case 13: 
                            btn.click();
                            break;
                        case 37: // <
                            var prev = query('.popupInfoButton.prev')[0];
                            prev.focus();
                            prev.click();
                            break;
                        case 39: // >
                            var next = query('.popupInfoButton.next')[0];
                            next.focus();
                            next.click();
                            break;
                    }
                }));
            });
            
            on(popup, "SelectionChange", lang.hitch(this, function() {
                dom.byId('featureIndex').innerHTML = popup.selectedIndex + 1;
            }));

            on(popup, "SetFeatures", lang.hitch(this, function() {
                if(popup.features && popup.features.length > 0) {
                    this.setTotal(popup.features.length);
                }
                else {
                    this.clearFeatures();

                }
            }));

            this.setTotal(0);
        },

        setTotal : function(count) {
            this.total = count;

            var msgNode = dojo.byId("popupMessage");
            var ctrlNode = dojo.byId("popupControls");
            var pagerNode = dojo.byId("popupPager");

            domStyle.set(dojo.byId("popupMessage"), 'display', (this.total === 0 ? 'inline' : 'none'));
            domStyle.set(dojo.byId("popupControls"), 'display', (this.total > 0 ? 'inline' : 'none'));
            domStyle.set(dojo.byId("popupPager"), 'display', (this.total > 1 ? 'inline' : 'none'));

            dom.byId('totalFeatures').innerHTML = this.total;

            if(this.total===0) {
                popupInfo.clear();
            }
        },

        selectPrevious : function () {
            // console.log('Prev');
            this.map.infoWindow.selectPrevious();
        },

        selectNext : function () {
            // console.log('Next');
            this.map.infoWindow.selectNext();
        },

        clearFeatures : function(ev) {
            this.setTotal(0);
            popupInfo.clear();
        },

        toMap : function(ev) {
            var popup = this.map.infoWindow;
            if(popup.selectedIndex>=0) {
                var geometry = popup.features[popup.selectedIndex].geometry;
                if(geometry.type === 'point')
                    this.panZoom(true);
            }
            // this.clearFeatures({});
            dojo.byId('mapDiv').focus();
       },

        zoomTo : function(ev) {
            this.panZoom(false);
        },

        panZoom: function(panOnly) {
            var popup = this.map.infoWindow;
            if(popup.selectedIndex<0) return;
            var geometry = popup.features[popup.selectedIndex].geometry;
            if(panOnly) {
                if (geometry.type !== "point") {
                    geometry = geometry.getExtent().getCenter();
                }
                this.map.centerAt(geometry);
            } else {
                if(geometry.type === "point") {
                    this.map.centerAndZoom(geometry, 13);
                } else {
                    var extent = geometry.getExtent().expand(1.5);
                    this.map.setExtent(extent);
                }
            }
        }

    });
    if (has("extend-esri")) {
        lang.setObject("dijit.PopupInfoHeader", Widget, esriNS);
    }
    return Widget;
});
