define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "dojo/dom","esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on", "dijit/form/DateTextBox",
    "dojo/Deferred", "dojo/promise/all", 
    "dojo/query", 
    "esri/tasks/query", "esri/tasks/QueryTask",
    "dojo/text!application/dijit/templates/FilterTemplate.html", 
    "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/event", 
    "dojo/string", 
    "application/Filters/FilterItem", 
    "dojo/text!application/dijit/templates/FilterTabTemplate.html",
    "dojo/text!application/Filters/templates/FilterItemTemplate.html",
    "dojo/text!application/Filters/templates/FilterString.html",
    "dojo/text!application/Filters/templates/FilterDate.html",
    "dojo/text!application/Filters/templates/FilterInteger.html",
    "dojo/text!application/Filters/templates/FilterDouble.html",
    "dojo/text!application/Filters/templates/FilterOID.html",
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/graphic",
    "esri/dijit/InfoWindow",
    "dojo/NodeList-dom", "dojo/NodeList-traverse"
    
    ], function (
        Evented, declare, lang, has, dom, esriNS,
        _WidgetBase, _TemplatedMixin, on, DateTextBox, 
        Deferred, all, 
        query,
        Query, QueryTask,
        FilterTemplate, 
        domClass, domAttr, domStyle, domConstruct, event, 
        string,
        FilterItem,
        filterTabTemplate, filterItemTemplate, 
        filterString, filterDate, filterInteger, filterDouble, filterOID,
        SimpleMarkerSymbol, PictureMarkerSymbol, Graphic,
        InfoWindow
    ) {
    var Widget = declare("esri.dijit.Filters", [_WidgetBase, _TemplatedMixin, Evented], {
        // defaults
        templateString: FilterTemplate,

        options: {
            map: null,
            layers: null,
            visible: true
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);

            this.domNode = srcRefNode;
            // properties
            this.set("map", defaults.map);
            this.set("layers", defaults.layers.filter(function(l){return l.visibility;}));
            window.filters = [];
            defaults.layers.filter(function(l){return l.visibility;}).forEach(lang.hitch(this,function(layer){
                window.filters.push({
                    id: layer.id, 
                    layer: layer, 
                    fields:layer.popupInfo.fieldInfos.filter(function(l){return l.visible;})
                });

            }));
            this.css = {
            };
        },

        startup: function () {
            if (!this.map) {
                this.destroy();
                console.log("Filter::map required");
            }
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function () {
                    this._init();
                }));
            }
        },

        _init: function () {
            var filtersTabs = dom.byId("filtersTabs");
            var addTab = function(filter, template, ck) {
                var tab = string.substitute(template, {id:filter.layer.id, name:filter.layer.layerObject.name, checked:ck});
                filtersTabs.innerHTML += tab;
            };
            var ck='checked';
            window.filters.forEach(function(filter){
                addTab(filter, filterTabTemplate, ck);
                var fieldsCombo = dom.byId("fields_"+filter.layer.id);
                filter.fields.forEach(lang.hitch(this, function(fl){
                    fieldsCombo.innerHTML += '<option value="'+fl.fieldName+'">'+fl.label+'</option>';
                }));
                ck='';
            });

            window.filterAdd = function(btn, id) {
                var fieldId = dom.byId('fields_'+id).value;
                var field = window.filters.find(function(i) {return i.id === id;}).fields.find(function(f) {return f.fieldName === fieldId;});
//                 console.log(field);
                
                var filtersList = dom.byId("filtersList_"+id);
                // 
                // esriFieldTypeString, esriFieldTypeDate, esriFieldTypeDouble, esriFieldTypeInteger,
                // esriFieldTypeOID, 
                var layer = window.filters.find(function(f){return f.id === id;}).layer;
//                 var typ = layer.layerObject.fields.find(function(f){return f.name == field.fieldName;}).type;

//                 var content = '';
//                 console.log(typ);
//                 switch(typ) {
//                     case "esriFieldTypeString":
//                         content = filterString;
//                         break;
//                     case "esriFieldTypeDate":
//                         content = filterDate;
//                         break;
//                     case "esriFieldTypeDouble":
//                         content = filterDouble;
//                         break;
//                     case "esriFieldTypeInteger":
//                         content = filterInteger;
//                         break;
//                     case "esriFieldTypeOID":
//                         content = filterOID;
//                         break;
//                 }


//                 var filterItem = string.substitute(filterItemTemplate, {
//                     field:field.fieldName, 
//                     field_label: field.label, 
//                     content:string.substitute(content, {field:field.fieldName})
//                 });
                //filtersList.innerHTML+=filterItem;

                var itemItem = new FilterItem({map:layer.layerObject._map, layer:layer, field:field});//, myItem);
                filtersList.appendChild(itemItem.domNode);
                itemItem.startup();
            };

            window.filterRemove = function(btn) {
                var li = btn.closest('li');
                li.remove();
            };

        },

    });
    if (has("extend-esri")) {
        lang.setObject("dijit.Filters", Widget, esriNS);
    }
    return Widget;
});