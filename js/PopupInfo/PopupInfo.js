define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/registry",
    "dojo/on", 
    "dojo/Deferred", "dojo/query", 
    "dojo/text!application/PopupInfo/templates/PopupInfo.html", 
    "dojo/dom", "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/parser", "dojo/ready",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",    
    "dojo/string", 
    "dojo/i18n!application/nls/resources",
    "esri/domUtils",
    "esri/dijit/Popup",
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, esriNS,
        _WidgetBase, _TemplatedMixin, registry,
        on, 
        Deferred, query,
        PopupInfoTemplate, 
        dom, domClass, domAttr, domStyle, domConstruct, event, 
        parser, ready,
        BorderContainer,
        ContentPane,
        string,
        i18n,
        domUtils,
        Popup
    ) {

    ready(function(){
        // Call the parser manually so it runs after our widget is defined, and page has finished loading
        parser.parse();
    });

    var Widget = declare("esri.dijit.PopupInfo", [_WidgetBase, _TemplatedMixin, Evented], {
        // defaults
        templateString: PopupInfoTemplate,

        options: {
            map: null,
            toolbar: null
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);
            this.domNode = srcRefNode;

            this.map = defaults.map;
            this.toolbar = defaults.toolbar;
            this._i18n = i18n;

            dojo.create("link", {
                href : "js/PopupInfo/Templates/PopupInfo.css",
                type : "text/css",
                rel : "stylesheet",
            }, document.head);
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


        content : "content",
            
        feature_title : "",

        // _setValueAttr: function(value){
        //     this.feature_title = value;
        // },

        _init: function () {

            this.loaded = true;

            var popup = this.map.infoWindow;

            popup.set("popupWindow", false);


            var displayPopupContent = lang.hitch(this, function (feature) {
                this.toolbar._toolOpen('infoPanel');
                if (feature) {
                    feature.infoTemplate = feature.getLayer().infoTemplate;
                    
                    feature_title.innerHTML=feature.getTitle();//content.innerHTML;
                    registry.byId("leftPane").set("content", feature.getContent());
                    // feature_content.innerHTML=feature.getNode().outerHTML;//getContent().outerHTML;
                    // console.log(feature.getContent());
                }
            });

            //when the selection changes update the side panel to display the popup info for the 
            //currently selected feature. 
            on(popup, "SelectionChange", lang.hitch(this, function() {
                displayPopupContent(popup.getSelectedFeature());
            }));

            on(popup, "ClearFeatures", function() {
                dom.byId("featureCount").innerHTML = "Click to select feature";
                this.domNode.innerHTML = "";
                domUtils.hide(dom.byId("pager"));
            });

            on(popup, "SetFeatures", lang.hitch(this, function() {
                displayPopupContent(popup.getSelectedFeature());
                if (popup.features && popup.features.length >= 1) {
                    dom.byId("featureCount").innerHTML = popup.features.length + " features selected";
                    //enable navigation if more than one feature is selected 
                    domUtils.show(dom.byId("pager"));
                } else {
                    dom.byId("featureCount").innerHTML = "0";
                    domUtils.hide(dom.byId("pager"));
                }
            }));
        },

        selectPrevious : function () {
            console.log('Prev');
            this.map.infoWindow.selectPrevious();
        },

        selectNext : function () {
            console.log('Next');
            this.map.infoWindow.selectNext();
        },

    });
    if (has("extend-esri")) {
        lang.setObject("dijit.PopupInfo", Widget, esriNS);
    }
    return Widget;
});
