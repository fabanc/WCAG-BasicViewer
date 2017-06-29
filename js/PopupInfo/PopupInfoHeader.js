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
            superNavigator: null,
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
                            ev.stopPropagation();
                            ev.preventDefault();
                            break;
                        case 37: // <
                            var _prev = query('.popupInfoButton.prev')[0];
                            _prev.focus();
                            _prev.click();
                            ev.stopPropagation();
                            ev.preventDefault();
                            break;
                        case 39: // >
                            var _next = query('.popupInfoButton.next')[0];
                            _next.focus();
                            _next.click();
                            ev.stopPropagation();
                            ev.preventDefault();
                            break;
                        case 40: // down
                            dojo.byId("leftPane").focus();
                            ev.stopPropagation();
                            ev.preventDefault();
                            break;
                        case 90: // Z
                            query('.popupInfoButton.zoom')[0].focus();
                            ev.stopPropagation();
                            ev.preventDefault();
                            break;
                        case 77: // M
                        case 80: // P
                            var _toMap = query('.popupInfoButton.map')[0];
                            _toMap.focus();
                            _toMap.click();
                            ev.stopPropagation();
                            ev.preventDefault();

                            break;
                        case 88: // X
                        case 67: // C
                        case 69: // E
                            query('.popupInfoButton.clear')[0].focus();
                            ev.stopPropagation();
                            ev.preventDefault();
                            break;

                    }
                }));
            });
            
            on(popup, "SelectionChange", lang.hitch(this, function() {
                if(popup.selectedIndex>=0) {
                    dom.byId('featureIndex').innerHTML = popup.selectedIndex + 1;
                }
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

            if(this.total > 0) {
                query('.popupInfoButton.next')[0].focus();
            }
        },

        selectPrevious : function () {
            // console.log('Prev');
            this.map.infoWindow.selectPrevious();
            this.clearSuperNavigator();
        },

        selectNext : function () {
            // console.log('Next');
            this.map.infoWindow.selectNext();
            this.clearSuperNavigator();
        },

        clearFeatures : function(ev) {
            this.superNavigator.followTheMapMode(false);
            this.setTotal(0);
            popupInfo.clear();
        },

        toMap : function(ev) {
            dojo.byId('mapDiv').focus();
            this.clearSuperNavigator();
       },

        zoomTo : function(ev) {
            this.panZoom(false);
            this.clearSuperNavigator();
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
        },

        clearSuperNavigator: function() {
            if(this.superNavigator) this.superNavigator.clear();
        },


    });
    if (has("extend-esri")) {
        lang.setObject("dijit.PopupInfoHeader", Widget, esriNS);
    }
    return Widget;
});
