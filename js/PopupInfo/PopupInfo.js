define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/registry",
    "dojo/on", 
    "dojo/Deferred", "dojo/query", 
    "dojo/text!application/PopupInfo/Templates/PopupInfo.html", 
    // "dojo/text!application/PopupInfo/Templates/PopupInfoHeader.html", 
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
            this.search = defaults.search;
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
            if (!this.map) {
                this.destroy();
                console.error("Map required");
                // return;
            }
            if (!this.toolbar) {
                this.destroy();
                console.error("Toolbar required");
                return;
            }
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function () {
                    this._init();
                }));
            }
        },

        postCreate : function() {
            if(this.superNavigator)
                this.superNavigator.badge = this.showBadge;
            if(this.search) {
                this.search.enableLabel = true;
                this.search.maxResults = 40;
                this.search.popupOpenOnSelect = true;

                this.search.on('search-results', function(e) {
                    console.log('search-results', e);
                });
                this.search.on('select-result', function(e) {
                    console.log('select-result', e);
                });
                this.search.infoTemplate.content = 
                    '<div class="${searchTheme}"><div id="${searchMoreResultsId}" class="${searchMoreResults}"><div class="${searchMoreResultsItem}">${searchResult}</div>'+
                    '<div>Results: ${*}</div>'+
                    '<div>${searchMoreResultsHtml}</div></div></div>';   
            }
        },

        popupInfoHeader : null,
        contentPanel : null,

        _init: function () {

            this.loaded = true;

            var popup = this.map.infoWindow;

            popup.set("popupWindow", false);

            //https://developers.arcgis.com/javascript/3/sandbox/sandbox.html?sample=popup_sidepanel

            contentPanel = new ContentPane({
                region: "center",
                id: "leftPane",
                tabindex: 0,
            }, dom.byId("feature_content"));
            contentPanel.startup();
            contentPanel.set("content", i18n.widgets.popupInfo.instructions);
            
            this.popupInfoHeader = new PopupInfoHeader({
                map: this.map,
                toolbar: this.toolbar, 
                superNavigator : this.superNavigator,
            }, domConstruct.create('Div', {}, this.headerNode));
            this.popupInfoHeader.startup();

            var displayPopupContent = lang.hitch(this, function (feature) {
                this.toolbar._toolOpen('infoPanel');
                if (feature) {
                    contentPanel.set("content", feature.getContent()).then(lang.hitch(this, function() {
                        var mainSection = query('.esriViewPopup .mainSection', dojo.byId('leftPane'));
                        if(mainSection) {
                            var header = query('.header', mainSection[0]);
                            if(header && header.length > 0) {
                                domAttr.set(header[0], 'tabindex', 0);
                            }

                            var attrTable = query('.attrTable', mainSection[0]);
                            if(attrTable && attrTable.length > 0) {
                                domAttr.set(attrTable[0], 'role', 'presentation');
                                var rows = query('tr', attrTable[0]);
                                if(rows) {
                                    rows.forEach(function(row) {domAttr.set(row, 'tabindex', 0);});
                                }
                            } 
                            else {
                                var description = query('[dojoattachpoint=_description]', mainSection[0]);
                                if(description && description.length > 0) {
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

            on(popup, "SetFeatures", lang.hitch(this, function() {
                // console.log("SetFeatures", popup.features);
            }));

            on(popup, "ClearFeatures", lang.hitch(this, function() {
                contentPanel.set("content", i18n.widgets.popupInfo.instructions);
                // if(this.superNavigator) {
                //     this.superNavigator.clearZone();
                // }
                if(this.popupInfoHeader) {
                    this.popupInfoHeader.setTotal(0);
                }
            }));

            on(popup, "SelectionChange", lang.hitch(this, function() {
                var selectedFeature = popup.getSelectedFeature();
                if(selectedFeature && selectedFeature !== undefined)
                    displayPopupContent(selectedFeature);
            }));

            on(this.toolbar, 'updateTool', lang.hitch(this, function(name) {
                if(this.superNavigator && name !== 'infoPanel') {
                    this.superNavigator.followTheMapMode(false);
                }
            }));

            on(dojo.byId('pageBody_infoPanel'), 'keydown', lang.hitch(this, function(ev) {
                switch(ev.keyCode) {
                    case 37: // <
                        this.popupInfoHeader.ToPrev();
                        ev.stopPropagation();
                        ev.preventDefault();
                        break;
                    case 39: // >
                        this.popupInfoHeader.ToNext();
                        ev.stopPropagation();
                        ev.preventDefault();
                        break;
                    case 90: // Z
                        this.popupInfoHeader.ToZoom();
                        ev.stopPropagation();
                        ev.preventDefault();
                        break;
                    case 77: // M
                    case 80: // P
                        this.popupInfoHeader.ToMap();
                        ev.stopPropagation();
                        ev.preventDefault();

                        break;
                    case 88: // X
                    case 67: // C
                    case 69: // E
                        this.popupInfoHeader.ToClear();
                        ev.stopPropagation();
                        ev.preventDefault();
                        break;

                }}));
        },

        clear: function() {
            this.map.infoWindow.clearFeatures();
            this.map.container.focus();
        },

        showBadge : function(show) {
            var indicator = dom.byId('badge_followTheMapMode');
            if (show) {
                domStyle.set(indicator,'display','');
                domAttr.set(indicator, "title", i18n.widgets.popupInfo.followTheMap);
                domAttr.set(indicator, "alt", i18n.widgets.popupInfo.followTheMap);
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
