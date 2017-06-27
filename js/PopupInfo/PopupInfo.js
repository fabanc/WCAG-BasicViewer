define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/registry",
    "dojo/on", 
    "dojo/Deferred", "dojo/query", 
    "dojo/text!application/PopupInfo/templates/PopupInfo.html", 
    // "dojo/text!application/PopupInfo/templates/PopupInfoHeader.html", 
    "dojo/dom", "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/parser", "dojo/ready",
    "dijit/layout/BorderContainer",
    "dojox/layout/ContentPane",    
    "dojo/string", 
    "dojo/i18n!application/nls/PopupInfo",
    "esri/domUtils",
    "esri/dijit/Popup", "application/PopupInfo/PopupInfoHeader","application/SuperNavigator/SuperNavigator",
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, esriNS,
        _WidgetBase, _TemplatedMixin, registry,
        on, 
        Deferred, query,
        PopupInfoTemplate, // PopupInfoHeaderTemplate, 
        dom, domClass, domAttr, domStyle, domConstruct, event, 
        parser, ready,
        BorderContainer,
        ContentPane,
        string,
        i18n,
        domUtils,
        Popup, PopupInfoHeader, SuperNavigator
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
            toolbar: null, 
            header: 'pageHeader_infoPanel',
            superNavigator : null,
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);
            this.domNode = srcRefNode;
            this.widgetsInTemplate = true;

            this.map = defaults.map;
            this.toolbar = defaults.toolbar;
            this._i18n = i18n;
            this.headerNode = dom.byId(defaults.header);
            this.superNavigator = defaults.superNavigator;

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

            var content = new ContentPane({
                // style: "padding:1px;",
                region: "center",
                id: "leftPane",
                tabindex: 0,
            },dom.byId("feature_content"));
            content.startup();
            
            // content.domNode.onchange = function() {
            //     console.log('changed');
            // };
            // content.set("href", "myHtml.html");


            // dojo.place(PopupInfoHeaderTemplate, this.headerNode);
            var popupInfoHeader = new PopupInfoHeader({
                map: this.map,
                toolbar: this.toolbar, 
                superNavigator : this.superNavigator,
            }, domConstruct.create('Div', {}, this.headerNode));
            popupInfoHeader.startup();

            var popup = this.map.infoWindow;

            popup.set("popupWindow", false);

            var displayPopupContent = lang.hitch(this, function (feature) {
                this.toolbar._toolOpen('infoPanel');
                if (feature) {
                    // feature.infoTemplate = feature.getLayer().infoTemplate;
                    
                    registry.byId("leftPane").set("content", feature.getContent()).then(lang.hitch(this, function() {
                        var mainSection = query('.esriViewPopup .mainSection', dojo.byId('leftPane'));
                        if(mainSection) {
                            var header = query('.header', mainSection[0]);
                            if(header) {
                                domAttr.set(header[0], 'tabindex', 0);
                            }

                            var attrTable = query('.attrTable', mainSection[0]);
                            if(attrTable && attrTable.length > 0) {
                                var rows = query('tr', attrTable[0]);
                                if(rows) {
                                    rows.forEach(function(row) {domAttr.set(row, 'tabindex', 0);});
                                }
                            } 
                            else {
                                var description = query('[dojoattachpoint=_description]', mainSection[0]);
                                if(description) {
                                    domAttr.set(description[0], 'tabindex', 0);
                                }
                            }

                            var editSummarySection = query('.esriViewPopup .editSummarySection', dojo.byId('leftPane'));
                            if(editSummarySection) {
                                var editSummary =  query('.editSummary', editSummarySection[0]);
                                if(editSummary) {
                                    editSummary.forEach(function(edit) { domAttr.set(edit, 'tabindex', 0);});
                                }
                            }
                            var images = query('.esriViewPopup img', dojo.byId('leftPane'));
                            if(images) {
                                // console.log(images);
                                images.forEach(function(img) {
                                    var alt = domAttr.get(img, 'alt');
                                    if(!alt) {
                                        domAttr.set(img,'alt','');
                                    } else {
                                        domAttr.set(img,'tabindex',0);
                                        if(!domAttr.get(img, 'title'))
                                        {
                                            domAttr.set(img,'title',alt);
                                        }
                                    }
                                });
                            }
                        }
                    }));
                }
            });

            //when the selection changes update the side panel to display the popup info for the 
            //currently selected feature. 
            on(popup, "SelectionChange", lang.hitch(this, function() {
                displayPopupContent(popup.getSelectedFeature());
            }));

            // on(popup, "ClearFeatures", lang.hitch(this, function() {
            //     // dom.byId("featureCount").innerHTML = this._i18n.popupInfo.clickToSelect;
            //     // this.domNode.innerHTML = "";
            //     domUtils.hide(dom.byId("pager"));
            // }));

            on(popup, "SetFeatures", lang.hitch(this, function() {
                // displayPopupContent(popup.getSelectedFeature());
            }));
        },

        clear: function() {
            this.map.infoWindow.clearFeatures();
            registry.byId("leftPane").set("content", i18n.widgets.popupInfo.instructions);
            if(this.superNavigator) {
                this.superNavigator.clear();
            }
            dojo.byId('mapDiv').focus();
        },


        _reloadList : function(ext) {
            if(!this._isVisible()) return;
            var loading_features = this.domNode.parentNode.parentNode.querySelector('#loading_infoPopu');

            domClass.replace(loading_features, "showLoading", "hideLoading");

            this.__reloadList(ext).then(function(results) {
                domClass.replace(loading_features, "hideLoading", "showLoading");
            });
        },

        showBadge : function(show) {
            var indicator = dom.byId('badge_featureSelected');
            if (show) {
                domStyle.set(indicator,'display','');
                domAttr.set(indicator, "title", i18n.widgets.featureList.featureSelected);
                domAttr.set(indicator, "alt", i18n.widgets.featureList.featureSelected);
            } else {
                domStyle.set(indicator,'display','none');
            }
        },


    });
    if (has("extend-esri")) {
        lang.setObject("dijit.PopupInfo", Widget, esriNS);
    }
    return Widget;
});
