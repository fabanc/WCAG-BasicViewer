define([
    "dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", 
    "esri/arcgis/utils", "dojo/has", "dojo/dom","esri/kernel", 
    //"dijit/_WidgetBase",
    "dijit/layout/_LayoutWidget", 
    "esri/layers/FeatureLayer",
    "esri/dijit/FeatureTable", "application/ImageToggleButton/ImageToggleButton", 
    //"dstore/RequestMemory",
    "esri/map", "dojo/_base/array", 
    //"dijit/_TemplatedMixin", 
    //"dojo/text!application/ShowFeatureTable/templates/ShowFeatureTable.html", 
    "dojo/i18n!application/nls/ShowFeatureTable",
    "dojo/on", "dojo/query", 
    "esri/tasks/query", "esri/tasks/QueryTask",
    "dijit/registry", "dojo/aspect", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", 
    "dijit/layout/ContentPane", "dijit/layout/BorderContainer",
    "dijit/form/DropDownButton", "dijit/DropDownMenu", "dijit/MenuItem",
    "dojo/dom-construct", "dojo/_base/event", 
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", 
    "esri/symbols/CartographicLineSymbol", 
    "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol",
    "esri/graphic", "esri/Color", "esri/graphicsUtils",
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, arcgisUtils, has, dom, esriNS,
        //_WidgetBase, 
        _LayoutWidget,
        FeatureLayer, FeatureTable, ImageToggleButton,
        //RequestMemory,
        Map, array,
        //_TemplatedMixin, 
        //ShowFeatureTableTemplate, 
        i18n,
        on, query, 
        Query, QueryTask,
        registry, aspect,
        domClass, domAttr, domStyle,
        ContentPane, BorderContainer, 
        DropDownButton, DropDownMenu, MenuItem,
        domConstruct, event,
        SimpleMarkerSymbol, PictureMarkerSymbol, 
        CartographicLineSymbol, 
        SimpleFillSymbol, SimpleLineSymbol,
        Graphic, Color, graphicsUtils
    ) {
    var Widget = declare("esri.dijit.ShowFeatureTable", [
        //_WidgetBase, 
        _LayoutWidget,
        //_TemplatedMixin, 
        Evented], {

        widgetsInTemplate: true, // ?
        //templateString: ShowFeatureTableTemplate,

        options: {
            map: null,
            layers: null,
        },

        _getShowAttr: function() { 
            if (!dojo.byId('featureTableContainer_splitter')) return false;
            return domStyle.get(dojo.byId('featureTableContainer_splitter'), "display") !== "none";
        },
        _setShowAttr: function(visible) { 
            switch(visible){
                case true:
                    domStyle.set(dojo.byId('featureTableContainer'), "height","50%");
                    domStyle.set(dojo.byId('featureTableContainer_splitter'), "display", "initial");
                    this.borderContainer.resize();
                    break;
                case false:
                    domStyle.set(dojo.byId('featureTableContainer'), "height","0");
                    domStyle.set(dojo.byId('featureTableContainer_splitter'), "display", "none");
                    this.borderContainer.resize();
                    break;
            }
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);

            this.map = defaults.map;
            this.layers = defaults.layers;
            this.domNode = srcRefNode;
            this.containerNode = srcRefNode;

            dojo.create("link", {
                href : "js/ShowFeatureTable/Templates/ShowFeatureTable.css",
                type : "text/css",
                rel : "stylesheet",
            }, document.head);

            //if(options.animatedMarker) {
                this.pointMarker = new esri.symbol.PictureMarkerSymbol({
                    "angle": 0,
                    "xoffset": 0,
                    "yoffset": 0,
                    "type": "esriPMS",
                    "url": require.toUrl("./images/SelectPointMarker3.gif"),
                    "contentType": "image/gif",
                    "width": 33,
                    "height": 33
                });
            // } else {
            //     this.pointMarker = new SimpleMarkerSymbol({
            //           "color": [3,126,175,20],
            //           "size": options.markerSize,
            //           "xoffset": 0,
            //           "yoffset": 0,
            //           "type": "esriSMS",
            //           "style": "esriSMSCircle",
            //           "outline": {
            //             "color": [3,26,255,220],
            //             "width": 2,
            //             "type": "esriSLS",
            //             "style": "esriSLSSolid"
            //           }
            //         });
            // }

            this.lineMarker = new CartographicLineSymbol(
                CartographicLineSymbol.STYLE_SOLID, new Color([0, 127, 255]), 10, 
                CartographicLineSymbol.CAP_ROUND,
                CartographicLineSymbol.JOIN_ROUND, 5);

            this.polygonMarker = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID, 
                new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([0, 127, 255]), 3),
                    new Color([0, 127, 255, 0.25]));

            this.borderContainer = new BorderContainer({
                design:'headline',
                gutters:false, 
                liveSplitters:true,
                class:"myBorderContainer",
                id:'bc',
                widgetsInTemplate: true
            });
             
            this.contentPaneMap = new ContentPane({
                region: "center",
                gutters:false, 
                splitter: false,
                style: "height:100%; width:100%; padding:0; overflow: none;",
                content: dojo.byId("mapDiv"), 
                id: 'contentPaneMap',
                class: "splitterContent",
            });
            this.borderContainer.addChild(this.contentPaneMap);

            this.contentPaneFeatureTable = new ContentPane({
                region: "bottom",
                gutters:false, 
                splitter: true,
                class: "bg",
                style: "height:50%;",
                id: 'featureTableContainer',
                content: domConstruct.create("div", { id: 'featureTableNode'}),
            });
            this.borderContainer.addChild(this.contentPaneFeatureTable);
            this.borderContainer.placeAt(dojo.byId('mapPlace'));

            this.borderContainer.startup();
        },

        postCreate: function() {
            this.inherited(arguments);
            this.set('show', false);
        },

        layout:function() {
            this.inherited(arguments);
            this.map.resize();
            this.map.reposition();
        },

        startup: function () {
            on(this.map, 'parentSize_changed', lang.hitch(this, function(ev) {
                this.borderContainer.resize();
            }));
            aspect.after(
                this.contentPaneFeatureTable.containerNode.parentNode, "resize", 
                lang.hitch(this, function() {
                this.borderContainer.resize();
            }));            
            aspect.after(
                this.contentPaneMap, "resize", 
                lang.hitch(this, function() {
                this.resize();
            }));            
            this.resize();
        },

        destroy: function() {
            this._removeAllGraphics(['ftMarker', 'rectView']);
            if(this.myFeatureTable)
                this.myFeatureTable.destroy();
            this.emit("destroied", {});
            this.set('show', false);
        },

        _rectangleGr : null,

        loadTable: function(myFeatureLayer){
            var outFields = [];
            var fieldInfos = [];
            var fieldsMap = myFeatureLayer.layerObject.infoTemplate._fieldsMap;
            for(var p in fieldsMap) {
                if(fieldsMap.hasOwnProperty(p) && fieldsMap[p].visible)
                {
                    var pField = fieldsMap[p];
                    outFields.push(pField.fieldName);

                    var fieldInfo = {
                        name : pField.fieldName,
                        alias: pField.label,
                    };
                    if(pField.hasOwnProperty('format')) {
                        var format = pField.format;
                        if(format.hasOwnProperty('dateFormat')) {
                            fieldInfo.dateOptions= {
                                datePattern: i18n.widgets.showFeatureTable.datePattern,
                                timeEnabled: false,
                            };
                        } 
                        else if(format.hasOwnProperty('time')) {
                            fieldInfo.dateOptions = {
                                datePattern: i18n.widgets.showFeatureTable.shortDatePattern, 
                                timeEnabled: true,
                                timePattern: i18n.widgets.showFeatureTable.shortTimePattern,
                            };
                        }
                        else {
                            fieldInfo.format = format;
                        }
                    }

                    fieldInfos.push(fieldInfo);
                }
            }

            this.layer = myFeatureLayer;
            this.myFeatureTable = new FeatureTable({
                //id:"myFeatureTable0",
                "featureLayer" : myFeatureLayer.layerObject,
                "map" : this.map,
                showAttachments: true,
                syncSelection: false, 
                zoomToSelection: true, 
                gridOptions: {
                    allowSelectAll: false,
                    allowTextSelection: false,
                    // pagination: true,
                    // pagingDelay: 1000,
                    // pageSizeOptions: [50, 100, 500],
                },
                editable: false,
                dateOptions: {
                    datePattern: i18n.widgets.showFeatureTable.datePattern,
                    timeEnabled: false
                },
                // timeOptions: {
                //     datePattern: i18n.widgets.showFeatureTable.datePattern,
                //     timeEnabled: true
                // },
                "outFields": outFields,
                fieldInfos: fieldInfos,
                // showRelatedRecords: true,
                showDataTypes: true,
                // showFeatureCount:true,
                showStatistics:false,
                menuFunctions: [
                    {
                        label: i18n.widgets.showFeatureTable.showTypes, 
                        callback: lang.hitch(this, function(evt){
                            // console.log(" Callback evt: ", evt);
                            var typeLabels = query('.esri-feature-table-column-header-type');
                            if(typeLabels && typeLabels.length>0) {
                                var show = domStyle.get(typeLabels[0], 'display') === 'none';
                                var l = evt.toElement.innerText;
                                if(show) {
                                    typeLabels.forEach( function(label) { domStyle.set(label, 'display', '');});
                                    evt.toElement.innerText = i18n.widgets.showFeatureTable.hideTypes;
                                }
                                else {
                                    typeLabels.forEach( function(label) { domStyle.set(label, 'display', 'none');});
                                    evt.toElement.innerText = i18n.widgets.showFeatureTable.showTypes;
                                }
                                this.myFeatureTable.resize();
                            }
                        })
                    },
                    // {
                    //     label: i18n.widgets.showFeatureTable.refresh, 
                    //     callback: lang.hitch(this, function(evt){
                    //         this.myFeatureTable.refresh();
                    //     })
                    // },
                    {
                        label: i18n.widgets.showFeatureTable.close, 
                        callback: lang.hitch(this, function(evt){
                            //this.destroy();
                            this.emit("destroy", {});
                        })
                    },
                ],
                cellNavigation:false,
                showColumnHeaderTooltips: false,
                showGridMenu: true,
            }, dojo.byId('featureTableNode'));

            this.myFeatureTable.startup();

            // var menuTables = query('table.dijitMenu');
            // if(menuTables) {
            //     menuTables.forEach(function(table) {
            //         domAttr.set(table, 'role','presentation');
            //     });
            // }

            var hidderToggle = query('.ui-icon.dgrid-hider-toggle')[0];
            if(hidderToggle) {
                domClass.remove(hidderToggle, 'ui-icon');
                domConstruct.create('img', {
                    alt:'',
                    title: hidderToggle.attributes['aria-label'].value,
                    src:'images/icons_black/Columns.32.png',
                }, hidderToggle);
            }

            var arrowButton = query('.esri-feature-table .dijitArrowButtonInner')[0];
            if(arrowButton) {
                domConstruct.create('img', {
                    // role: 'presentation',
                    src: 'images/icons_black/carret-down.32.png',
                    alt: 'carret-down'
                }, arrowButton);
            }

            if(this.layers && this.layers.length > 1) {
                var menu = new DropDownMenu({ style: "display: none;"});
                this.layers.forEach(lang.hitch(this, function(layer){
                    var menuItem1 = new MenuItem({
                        label: layer.title,
                        'data-layerid': layer.id,
                        //onClick: function(){ alert(layer.title); }
                    });
                    on(menuItem1.domNode, 'click', lang.hitch(this, function(ev){ 
                        console.log(layer.title, ev.target.parentElement.dataset.layerid, ev); 
                    }));
                    //menu.addChild(menuItem1);
                    domConstruct.place(menuItem1.domNode, menu.domNode, 0);
                }));
                menu.startup();

                var button = new DropDownButton({
                    label: 'label',
                    name: "progButton",
                    dropDown: menu,
                    id: "progButton"
                });
                button.startup();

                var tableTitle = query('.esri-feature-table-title')[0];
                // domStyle.set(tableTitle,'display', 'none');
                var titleNodeObserver = new MutationObserver(lang.hitch(this, function(mutations) {
                    mutations.forEach(lang.hitch(this, function(mutation) {
                        console.log(mutation);
                        if(mutation.target.toString() === "[object Text]") {
                            var pattern = /(.*)(\s\(.*\))/;
                            var matches = mutation.target.nodeValue.match(pattern);
                            console.log(matches);
                            if(matches && matches.length === 3) {
                                var label = this.layer.title + matches[2];
                                var title = domConstruct.create('div', {
                                    //innerHTML: label,
                                    class: 'esri-feature-table-menu-item esri-feature-table-title titleDivDiv',
                                });

                                title.appendChild(button.domNode);
                                query('#progButton_label', title)[0].innerText = label;

                                query(".titleDivDiv").forEach(domConstruct.destroy);
                                domConstruct.place(title, tableTitle, 'before');
                                domStyle.set(tableTitle, 'display', 'none');
                            }
                        }
                    }));    
                })).observe(tableTitle.childNodes[0], { 
                    attributes: false, 
                    childList: true, 
                    characterData: true 
                });
            }




            var featureTableTools = domConstruct.create('div', {
                class:'esri-feature-table-menu-item',
                id: 'featureTableTools',
            });
            domConstruct.place(featureTableTools, tableTitle, 'before');

            var optionsMenu = query('.esri-feature-table-menu-item.esri-feature-table-menu-options')[0];

            var featureTableEndTools = domConstruct.create('div', {
                class:'esri-feature-table-menu-item',
                id: 'featureTableEndTools',
            }, optionsMenu);

            var closeBtn = domConstruct.create('img', {
                src: 'images/close.png',
                id: 'featureTableCloseBtn',
                alt: '',
                title: i18n.widgets.showFeatureTable.close,
            }, featureTableEndTools);
            on(closeBtn, 'click', lang.hitch(this, function(ev) { this.emit("destroy", {}); }));

            var SelectOnMapOrView = new ImageToggleButton({
                imgSelected: 'images/SelectOnView.png',
                imgUnselected: 'images/SelectOnMap.png',
                titleUnselected: i18n.widgets.showFeatureTable.listFromMap, 
                titleSelected: i18n.widgets.showFeatureTable.listFromView, 
            }, domConstruct.create('div', {}, featureTableTools));

            SelectOnMapOrView.startup();

            var SelectOnRectangle = new ImageToggleButton({
                imgSelected: 'images/SearchList.Checked.png',
                imgUnselected: 'images/SearchList.Unchecked.png',
                titleUnselected: i18n.widgets.showFeatureTable.listFromMap, 
                titleSelected: i18n.widgets.showFeatureTable.listFromView, 
            }, domConstruct.create('div', {}, featureTableTools));

            SelectOnRectangle.startup();

            on(SelectOnMapOrView, 'change', lang.hitch(this, function(ev) {
                // console.log(ev.checked, SelectOnMapOrView.isChecked());
                if(SelectOnMapOrView.isChecked()) {
                    SelectOnRectangle.Check(false);
                    this._selectViewIds();
                    this._selectSignal = on(this.map, "extent-change", 
                        lang.hitch(this, function() {this._selectViewIds();}));
                } else {
                    this._selectSignal.remove();
                    this.myFeatureTable.clearFilter();
                }
            }));
            on(SelectOnRectangle, 'change', lang.hitch(this, function(ev) {
                // // console.log(ev.checked, SelectOnMapOrView.isChecked());
                if(SelectOnRectangle.isChecked()) {
                    SelectOnMapOrView.Check(false);

                    require(["esri/toolbars/draw"], lang.hitch(this, function(Draw) { 
                        var toolbar = new Draw(this.map);
                        toolbar.activate(Draw.EXTENT, {
                            showTooltips: false,
                        });
                        this.map.setMapCursor("url(images/Select.cur),auto");
                        this.map.hideZoomSlider();
                        toolbar.on("draw-end", lang.hitch(this, function(evt) {
                            this.map.setMapCursor("default");
                            var symbol;
                            toolbar.deactivate();
                            this.map.showZoomSlider();
                            symbol = new SimpleLineSymbol().setColor('red');
                            this._rectangleGr = new Graphic(evt.geometry, symbol);
                            this._rectangleGr.name = 'rectView';
                            this._selectViewIds(this._rectangleGr.geometry);
                            this.map.graphics.add(this._rectangleGr);
                            var extent = graphicsUtils.graphicsExtent([this._rectangleGr]).expand(1.2);
                            this.map.setExtent(extent);
                        }));
                    }));
                }
                else 
                {
                    if(this._rectangleGr) {
                        this.map.graphics.remove(this._rectangleGr);
                        this.myFeatureTable.clearFilter();
                    }
                }
            }));


            this.set('show', true);

            dojo.create('img', {
                src:'images/reload1.gif',
                alt: 'Refresh',
                title: 'Refresh',
                style:'width:30px; height:30px;'
            }, query('.esri-feature-table-menu-item.esri-feature-table-loading-indicator')[0]);

            var typeLabels = query('.esri-feature-table-column-header-type');
            if(typeLabels && typeLabels.length>0) {
                //evt.toElement.innerText = i18n.widgets.showFeatureTable.showTypes;
                typeLabels.forEach( function(label) { domStyle.set(label, 'display', 'none');});
            }

            var dgridRowTable = query('.dgrid-row-table');
            if(dgridRowTable && dgridRowTable.length>0) {
                dgridRowTable.forEach(function(table) {
                    domAttr.remove(table, 'role');
                });
            }

            //this.borderContainer.resize();

            // on(this.myFeatureTable, "load", lang.hitch(this, function(evt){
            //     console.log("The load event - ", evt);
            // }));

            // on(this.myFeatureTable, "show-statistics", function(evt){
            //     console.log("show-statistics avgfield - ", evt.statistics.avgField);
            //     console.log("show-statistics countfield - ", evt.statistics.countField);
            //     console.log("show-statistics maxfield - ", evt.statistics.maxField);
            //     console.log("show-statistics minfield - ", evt.statistics.minField);
            //     console.log("show-statistics stddevfield - ", evt.statistics.stddevField);
            //     console.log("show-statistics sumfield - ", evt.statistics.sumField);
            // });

            on(this.myFeatureTable, "error", function(evt){
                console.log("error event - ", evt);
            });

            on(this.myFeatureTable, "row-select", lang.hitch(this, function(evt){
                //this._selectSignal.remove();

                evt.rows.forEach(lang.hitch(this, function(row) {

                    var objectIdFieldName = this.layer.layerObject.objectIdField;
                    q = new Query();
                    q.where = objectIdFieldName+"="+row.id;
                    q.outFields = [objectIdFieldName];
                    q.returnGeometry = true;
                    new QueryTask(this.layer.layerObject.url).execute(q).then(lang.hitch(this, function(ev) {
                        var graphic = ev.features[0];
                        //console.log(ev, graphic);
                        var markerGeometry;
                        var marker;

                        switch (graphic.geometry.type) {
                            case "point":
                                markerGeometry = graphic.geometry;
                                marker = this.pointMarker;
                                break;
                        //case "extent":
                            // markerGeometry = graphic.getCenter();
                            // marker = new SimpleMarkerSymbol();
                            // break;
                        case "polyline" :
                            markerGeometry = graphic.geometry;
                            marker = this.lineMarker;
                            break;
                        default:
                            // if the graphic is a polygon
                            markerGeometry = graphic.geometry;
                            marker = this.polygonMarker;
                            break;
                        }

                        var gr = new Graphic(markerGeometry, marker);
                        gr.tag = row.id;
                        gr.name = 'ftMarker';
                        this.map.graphics.add(gr);

                        if(!SelectOnMapOrView.isChecked() && ! SelectOnRectangle.isChecked()) {
                            var grs = array.filter(this.map.graphics.graphics, function(gr){ return gr.name && gr.name === 'ftMarker'; });
                            var extent = (this, graphicsUtils.graphicsExtent(grs)).expand(1.5);
                            this.map.setExtent(extent);
                        }
                    }));
                }));

                //this._delay(500).then(lang.hitch(this, function() {this._selectSignal = on(this.map, "extent-change", lang.hitch(this, this._selectViewIds, this));}));
            }));

            on(this.myFeatureTable, "row-deselect", lang.hitch(this, function(evt){
                //console.log("deselect event: ", evt.rows.length);
                evt.rows.forEach(lang.hitch(this, function(row) {
                    this.map.graphics.graphics.forEach(lang.hitch(this, function(gr) { 
                        if(gr.tag && gr.tag === row.id) {
                            this.map.graphics.remove(gr);
                        }
                    }));
                }));

                if(!SelectOnMapOrView.isChecked() && !SelectOnRectangle.isChecked()) {
                    var grs = array.filter(this.map.graphics.graphics, function(gr){ return gr.name && gr.name === 'ftMarker'; });
                    if(grs && grs.length>=2) {
                        var extent = (this, graphicsUtils.graphicsExtent(grs)).expand(1.5);
                        this.map.setExtent(extent);
                    }
                }
            }));

            on(this.myFeatureTable, "refresh", lang.hitch(this, function(evt){
                this._removeAllGraphics(['ftMarker']);
            }));

            // on(this.myFeatureTable, "column-resize", lang.hitch(this, function(evt){
            // //triggered by ColumnResizer extension
            //     console.log("column-resize event - ", evt);
            // }));

            // on(this.myFeatureTable, "column-state-change", function(evt){
            //     // triggered by ColumnHider extension
            //     console.log("column-state-change event - ", evt);
            // });

            // on(this.myFeatureTable, "sort", function(evt){
            //     console.log("sort event - ", evt);
            // });

            // on(this.myFeatureTable, "filter", function(evt){
            //     console.log("filter event - ", evt);
            // });

        },

        _removeAllGraphics: function(names) {
            this.map.graphics.graphics.forEach(lang.hitch(this, function(gr) { 
                if(gr.name && names.contains(gr.name)) { //(gr.name === 'ftMarker' || gr.name === 'rectView')) {
                    this.map.graphics.remove(gr);
                }
            }));
        },

        _selectSignal: null,

        _selectViewIds: function(geometry) {
            var objectIdFieldName = this.layer.layerObject.objectIdField;
            q = new Query();
            q.outFields = [objectIdFieldName];
            q.geometry = geometry ? geometry : this.map.extent;
            var exp=this.layer.layerObject.getDefinitionExpression() || null;
            q.where = exp;
            q.returnGeometry = true;
            new QueryTask(this.layer.layerObject.url).execute(q).then(lang.hitch(this, function(ev) {
                var selectedIds = ev.features.map(function(f) {return f.attributes[objectIdFieldName];});
                this.myFeatureTable.filterRecordsByIds(selectedIds);
            }));
        },

        // _delay: function(ms) {
        //     var deferred = new dojo.Deferred();
        //     setTimeout(function() {deferred.resolve(true);}, ms);
        //     return deferred.promise;
        // },


    });

    if (has("extend-esri")) {
        lang.setObject("dijit.ShowFeatureTable", Widget, esriNS);
    }
    return Widget;
});