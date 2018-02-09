define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", 
    "dojo/on", 
    "esri/tasks/locator", "esri/geometry/webMercatorUtils",
    "dojo/query", 
    "dojo/text!application/GeoCoding/templates/GeoAddressTooltip.html", 
    "dojo/dom", "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", 
    "esri/geometry/Point",
    "dojo/parser", "dojo/ready",
    "dojo/i18n!application/nls/PopupInfo",
    "dojo/parser", "dojo/ready"
], function (
        Evented, declare, lang, has, esriNS,
        _WidgetBase, _TemplatedMixin, 
        on, 
        Locator, webMercatorUtils,
        query,
        GeoAddressTooltip, 
        dom, domClass, domAttr, domStyle, domConstruct, 
        Point,
        parser, ready,
        i18n
    ) {

    ready(function(){
        // Call the parser manually so it runs after our widget is defined, and page has finished loading
        parser.parse();
    });

    var Widget = declare("esri.dijit.GeoAddressTooltip", [_WidgetBase, _TemplatedMixin, Evented], {
        // defaults
        templateString: GeoAddressTooltip,

        options: {
            map: null,
            toolbar: null, 
            header: 'pageHeader_geoCoding',
            superNavigator : null,
            iconColor: 'white',
            themeColor: 'navy',
            addressTooltipButton: null,
            locator: null
        },

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);
            this.domNode = srcRefNode;
            this.widgetsInTemplate = true;

            this.map = defaults.map;
            this.toolbar = defaults.toolbar;
            this.iconColor = defaults.iconColor;
            this.themeColor = defaults.themeColor;

            this._i18n = i18n;
            // this.superNavigator = defaults.superNavigator;
            this.addressTooltipButton = defaults.addressTooltipButton;
            this.locator = defaults.locator;
        },

        startup: function () {
            if (!this.map || !this.toolbar) {
                this.destroy();
                console.log("GeoAddressTooltips: map or toolbar required");
            }
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function () {
                    this._init();
                }));
            }
        },

        locatorSignal: null,

        switchTooltips: function(active) {
        	switch(active) {
        		case false: 
                    if(this.locatorSignal) {
                        this.locatorSignal.remove();
                        this.locatorSignal = null;
                        this.closeDialog();
                        }
        			break;
        		case true:
                    this.locatorSignal = this.map.on('mouse-move', lang.hitch(this, this.hoverMap));
        			break;
        	}
        },

        _init: function () {

            this.loaded = true;

            this.addressToolTip = query('.address-tooltip')[0];
            this.tipHeader = dom.byId('addrHintTitle');
            this.tipContent = dom.byId('addrHintContent');

            this.addressTooltipButton.activate = lang.hitch(this, this.switchTooltips);

            on(this.toolbar, 'updateTool', lang.hitch(this, function(name) {
                if(this.addressTooltipButton.isActive()) {
                    this.addressTooltipButton.activate(name === 'geoCoding');
                }
            }));

            this.spikeNE = query('.address-tooltip__spike--NE')[0];
            this.spikeNW = query('.address-tooltip__spike--NW')[0];
            this.spikeSE = query('.address-tooltip__spike--SE')[0];
            this.spikeSW = query('.address-tooltip__spike--SW')[0];
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

            var mapDiv = dojo.byId('mapDiv');
            var location = this.map.toScreen(evt.location);

            var mapSize = {w: mapDiv.clientWidth, h:mapDiv.clientHeight};
            var mapMin = {x:mapDiv.clientLeft, y:mapDiv.clientTop};
            var mapMax = {x:mapDiv.clientLeft+mapSize.w, y:mapDiv.clientTop+mapSize.h};

            var mapCenter = {x:mapSize.w/2+mapMin.x, y:mapSize.h/2+mapMin.y};
			

			// var mapMin = this.map.toScreen({ type: "point", x:this.map.extent.xmin, y:this.map.extent.ymin, 'spatialReference':this.map.spatialReference});
			// var mapMax = this.map.toScreen({ type: "point", x:this.map.extent.xmax, y:this.map.extent.ymax, 'spatialReference':this.map.spatialReference});
			var mapH = dojo.byId('mapDiv').clientHeight;
			var mapW = dojo.byId('mapDiv').clientWidth;

            if(location.x <= mapCenter.x && location.y<=mapCenter.y) {
            	console.log("NW");
            	domStyle.set(this.spikeNE, "display", "");
            	domStyle.set(this.spikeNW, "display", "block");
            	domStyle.set(this.spikeSE, "display", "");
            	domStyle.set(this.spikeSW, "display", "");

            	domStyle.set(this.addressToolTip, "top", (location.y+12)+"px");
            	domStyle.set(this.addressToolTip, "bottom", "");
            	domStyle.set(this.addressToolTip, "left", (location.x-12)+"px");
            	domStyle.set(this.addressToolTip, "right", "");
            } else if(location.x > mapCenter.x && location.y<=mapCenter.y) {
            	console.log("NE");
            	domStyle.set(this.spikeNE, "display", "block");
            	domStyle.set(this.spikeNW, "display", "");
            	domStyle.set(this.spikeSE, "display", "");
            	domStyle.set(this.spikeSW, "display", "");

            	domStyle.set(this.addressToolTip, "top", (location.y+12)+"px");
            	domStyle.set(this.addressToolTip, "bottom", "");
            	domStyle.set(this.addressToolTip, "right", (mapW-location.x)+"px");
            	domStyle.set(this.addressToolTip, "left", "");
            } else if(location.x <= mapCenter.x && location.y>mapCenter.y) {
            	console.log("SW");
            	domStyle.set(this.spikeNE, "display", "");
            	domStyle.set(this.spikeNW, "display", "");
            	domStyle.set(this.spikeSE, "display", "");
            	domStyle.set(this.spikeSW, "display", "block");

            	domStyle.set(this.addressToolTip, "top", "");
            	domStyle.set(this.addressToolTip, "bottom", (mapH-location.y+12)+"px");
            	domStyle.set(this.addressToolTip, "left", (location.x-12)+"px");
            	domStyle.set(this.addressToolTip, "right", "");
            } else if(location.x > mapCenter.x && location.y>mapCenter.y) {
            	console.log("SE");
            	domStyle.set(this.spikeNE, "display", "");
            	domStyle.set(this.spikeNW, "display", "");
            	domStyle.set(this.spikeSE, "display", "block");
            	domStyle.set(this.spikeSW, "display", "");

            	domStyle.set(this.addressToolTip, "top", "");
            	domStyle.set(this.addressToolTip, "bottom", (mapH-location.y+12)+"px");
            	domStyle.set(this.addressToolTip, "left", "");
            	domStyle.set(this.addressToolTip, "right", (mapW-location.x-12)+"px");
            }

            this.tipHeader.innerHTML=address.AddrTypeLoc+address.TypeLoc;
            this.tipContent.innerHTML=address.Match_addr;

            domStyle.set(this.addressToolTip, "display", "block");

            this.map.setMapCursor('none');  
            this.tipContent.focus();            
        },

        closeDialog: function () {
            if(this.addressToolTip)
                this.addressToolTip.style = "display:none;";
            this.map.setMapCursor('default');
        },

        locatorDeffered: null,

        hoverMap : function(ev) {
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

    });

    if (has("extend-esri")) {
        lang.setObject("dijit.GeoAddressTooltip", Widget, esriNS);
    }
    return Widget;
});
