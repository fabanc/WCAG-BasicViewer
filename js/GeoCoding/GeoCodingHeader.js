define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", 
    "dojo/on", 
    "esri/tasks/locator", "esri/geometry/webMercatorUtils",
    "dojo/query", 
    "dojo/text!application/GeoCoding/templates/GeoCodingHeader.html", 
    "dojo/dom", "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", 
    "dojo/parser", "dojo/ready",
    "dojo/i18n!application/nls/PopupInfo",
    "dojox/gfx"
    
    ], function (
        Evented, declare, lang, has, esriNS,
        _WidgetBase, _TemplatedMixin, 
        on, 
        Locator, webMercatorUtils,
        query,
        GeoCodingHeaderTemplate, 
        dom, domClass, domAttr, domStyle, domConstruct, 
        parser, ready,
        i18n,
        gfx
    ) {

    // ready(function(){
    //     // Call the parser manually so it runs after our widget is defined, and page has finished loading
    //     parser.parse();
    // });

    var Widget = declare("esri.dijit.GeoCodingHeader", [_WidgetBase, _TemplatedMixin, Evented], {
        // templateString: GeoCodingHeaderTemplate,

        options: {
            map: null,
            toolbar: null, 
            header: 'pageHeader_geoCoding',
            id: 'geoCodingHeadrId',
            popupInfo: null,
            superNavigator: null,
            iconColor: 'white',
            template: GeoCodingHeaderTemplate,
            self: null,
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);
            this.domNode = srcRefNode;
            this.widgetsInTemplate = true;

            this.map = defaults.map;
            this.toolbar = defaults.toolbar;
            this.templateString = defaults.template;
            this.popupHeaderId = defaults.id;
            this._i18n = i18n;
            this.headerNode = dom.byId(defaults.header);
            this.popupInfo = defaults.popupInfo;
            this.emptyMessage = defaults.emptyMessage;
            this.contentPanel = defaults.contentPanel;
            this.self = defaults.self;
            this.iconColor=defaults.iconColor;
            this.themeColor = defaults.themeColor,

            this.locator = new Locator("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
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

        _init: function () {

            this.loaded = true;

            // var popup = this.map.infoWindow;

            on(query('#'+this.popupHeaderId+' .popupInfoButton.tooltips')[0], 'click', lang.hitch(this, this.switchTooltips));
            on(query('#'+this.popupHeaderId+' .popupInfoButton.zoom')[0], 'click', lang.hitch(this, this.zoomTo));
            on(query('#'+this.popupHeaderId+' .popupInfoButton.map')[0], 'click', lang.hitch(this, this.toMap));
            on(query('#'+this.popupHeaderId+' .popupInfoButton.clear')[0], 'click', lang.hitch(this, this.clearAddress));

            var buttons = query(".popupInfoButton");
            buttons.forEach(lang.hitch(this, function (btn) {
                on(btn,'keydown', lang.hitch(this, function(ev) {
                    switch(ev.keyCode) {
                        case 13: 
                            btn.click();
                            ev.stopPropagation();
                            ev.preventDefault();
                            break;
                        case 40: // down
                            dojo.byId("geoCodingContent").focus();
                            ev.stopPropagation();
                            ev.preventDefault();
                            break;
                        case 90: // Z
                            this.ToZoom();
                            ev.stopPropagation();
                            ev.preventDefault();
                            break;
                        case 77: // M
                        case 80: // P
                            this.ToMap();
                            ev.stopPropagation();
                            ev.preventDefault();
                            break;
                        case 88: // X
                        case 67: // C
                        case 69: // E
                            this.ToClear();
                            ev.stopPropagation();
                            ev.preventDefault();
                            break;
                    }
                }));
            }));

            on(this.toolbar, 'updateTool', lang.hitch(this, function(name) {
                // console.log(name);
                var btn = dojo.byId('addrTooltipBtn');
                if(dojo.hasClass(btn, 'activeBg')) {
                    if(name !== 'geoCoding') {
                        if(this.locatorSignal) {
                            this.locatorSignal.remove();
                            this.locatorSignal = null;
                            this.closeDialog();
                            }
                        }
                    else {
                        this.locatorSignal = this.map.on('mouse-move', lang.hitch(this, this.hoverMap));
                    }
                }
            }));
        },

        ToZoom: function() {
            query('.popupInfoButton.zoom')[0].focus();
        },

        ToMap : function() {
            var _toMap = query('.popupInfoButton.map')[0];
            _toMap.focus();
            _toMap.click();
        },

        ToClear : function() {
            query('.popupInfoButton.clear')[0].focus();
        },

        clearAddress : function(ev) {
            lang.hitch(self, this.self.clearSearchGraphics());
            this.contentPanel.set("content", i18n.widgets.geoCoding.instructions);
            this.map.container.focus();
        },

        toMap : function(ev) {
            this.map.container.focus();
            this.clearSuperNavigator();
       },

        showTooltip: function (evt){
            this.closeDialog();
            var address = evt.address;
            
            if(address.Addr_type.isNonEmpty()) {
                var prop = address.Addr_type.replace(' ', '');
                address.AddrTypeLoc = (i18n.widgets.hasOwnProperty('addrType') && i18n.widgets.addrType.hasOwnProperty(prop)) ?
                i18n.widgets.addrType[prop] : address.Addr_type;
            }
            if(address.Type.isNonEmpty()) {
                var prop1 = address.Type.replace(' ', '');
                address.TypeLoc = " - <i>"+((i18n.widgets.hasOwnProperty('addrType') && 
                    i18n.widgets.addrType.hasOwnProperty(prop1)) ?
                i18n.widgets.addrType[prop1] : address.Type) + "</i>";
            } 
            else {
                address.TypeLoc = '';
            }

            var location = this.map.toScreen(evt.location);

            if(!this.addressToolTip) {
                this.addressToolTip = domConstruct.create('div', {
                    class:'address-tooltip bg'  
                }, 'mapDiv');
                
                var spikeDiv = domConstruct.create('div', {
                    id: 'spikeDiv',
                    style:'position:absolute; pointer-events:none; '+
                    'top:-12px; left:12px;',
                    }, this.addressToolTip);
                var spike = gfx.createSurface("spikeDiv", 20, 20);
                var path = spike.createPath("M 0 12 L 0 0 12 12")
                    .setFill(this.themeColor)
                    .setStroke({color:"black", width:1, style:"solid", cap:"but"})
                    ;

                this.tipHeader = domConstruct.create('div', {
                    id:'addrHintTitle',
                    tabindex:0
                }, this.addressToolTip);
                this.tipContent = domConstruct.create('div', {
                    id:'addrHintContent',
                    tabindex:0
                }, this.addressToolTip);

                domConstruct.place(this.tipHeader, this.addressToolTip);                
                domConstruct.place(this.tipContent, this.addressToolTip);  
            }

            this.tipHeader.innerHTML=address.AddrTypeLoc+address.TypeLoc;
            this.tipContent.innerHTML=address.Match_addr;

            this.addressToolTip.style = "display:block; "+
                "top:"+(location.y+12)+"px; "+
                "left:"+(location.x-12)+"px;";
            this.map.setMapCursor('none');  
            this.tipContent.focus();            
        },

        closeDialog: function () {
            if(this.addressToolTip)
                this.addressToolTip.style = "display:none;";
            this.map.setMapCursor('default');
        },

        locatorSignal: null,

        switchTooltips : function(ev) {
            if(this.locator) {
                if(this.locatorSignal) {
                    domClass.remove(ev.target, 'activeBg');
                    if(this.locatorSignal) {
                        this.locatorSignal.remove();
                        this.locatorSignal = null;
                        this.closeDialog();
                    }
                }
                else {
                    domClass.add(ev.target, 'activeBg');
                    this.locatorSignal = this.map.on('mouse-move', lang.hitch(this, this.hoverMap));
                }
            }
        },

        locatorDeffered: null,

        hoverMap : function(ev) {
            // if(!this.toolbar.IsToolSelected('geoCoding')) return;

            if(this.locatorDeffered && !this.locatorDeffered.isFulfilled()) {
                this.closeDialog();
            }
            else 
            {
                this.locatorDeffered = this.locator.locationToAddress(
                    webMercatorUtils.webMercatorToGeographic(ev.mapPoint), 1)
                .then(
                    lang.hitch(this, function(result) {
                        this.showTooltip(result);
                    }),
                    function(error) {
                        if(error.name !== "CancelError")
                            console.log('locator eror: ', error);
                    }
                );
            }
        },

        zoomTo : function(ev) {
            this.panZoom();
            this.clearSuperNavigator();
        },

        panZoom: function() {
            var marker = this.self.geoCodingMarkerGraphic;
            if(marker) {
                var addrType = marker.attributes.Addr_type;
                var zoomLevel = 13;
                switch (addrType) {
                    case 'PointAddress' :
                        zoomLevel = 18;
                        break;
                    case 'StreetAddress' :
                    case 'StreetName' :
                        zoomLevel = 16;
                        break;
                    case 'Park' :
                        zoomLevel = 15;
                        break;
                    case 'Locality' :
                        zoomLevel = 10;
                        break;
                    case 'Postal' :
                        zoomLevel = 8;
                        break;
                }
                this.map.centerAndZoom(this.self.geoCodingMarkerGraphic.geometry, zoomLevel);
            }
        },

        clearSuperNavigator: function() {
            if(this.superNavigator) 
                this.superNavigator.clearZone();
        },


    });
    if (has("extend-esri")) {
        lang.setObject("dijit.GeoCodingHeader", Widget, esriNS);
    }
    return Widget;
});
