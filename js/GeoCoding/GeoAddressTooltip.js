define(["dojo/Evented", "dojo/_base/declare", "dojo/_base/lang", "dojo/has", "esri/kernel", 
    "dijit/_WidgetBase", "dijit/_TemplatedMixin", 
    "dojo/on", 
    "esri/tasks/locator", "esri/geometry/webMercatorUtils",
    "dojo/query", 
    "dojo/text!application/GeoCoding/templates/GeoAddressTooltip.html", 
    "dojo/dom", "dojo/dom-class", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-construct", 
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

            this.addressTooltipButton.activated = lang.hitch(this, this.switchTooltips);

			on(this.toolbar, 'updateTool', lang.hitch(this, function(name) {
                // console.log(name);
                var btn = this.addressTooltipButton;//dojo.byId('addrTooltipBtn');
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
            }));        },

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
