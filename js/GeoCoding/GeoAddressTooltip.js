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
            themeColor: 'navy'
        },

        locator : null,

        constructor: function (options, srcRefNode) {
            var defaults = lang.mixin({}, this.options, options);
            this.domNode = srcRefNode;
            this.widgetsInTemplate = true;

            this.map = defaults.map;
            this.toolbar = defaults.toolbar;
            this.iconColor = defaults.iconColor;
            this.themeColor = defaults.themeColor,

            this._i18n = i18n;
            this.headerNode = dom.byId(defaults.header);
            // this.superNavigator = defaults.superNavigator;

            // dojo.create("link", {
            //     href : "js/GeoCoding/Templates/geoAddressTooltip.css",
            //     type : "text/css",
            //     rel : "stylesheet",
            // }, document.head);

            this.locator = new Locator("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
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

        _init: function () {

            this.loaded = true;

            // var addrTooltipsButton = query('#'+this.popupHeaderId+' .popupInfoButton.tooltips')[0];

            // on(addrTooltipsButton, 'click', lang.hitch(this, this.switchTooltips));
            // on(addrTooltipsButton,'keydown', lang.hitch(this, function(ev) {
            //     if(ev.keyCode === 13) { 
            //         btn.click();
            //         ev.stopPropagation();
            //         ev.preventDefault();
            //     }
            // }));

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
            }));        },

        locatorSignal: null,

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

    });

    if (has("extend-esri")) {
        lang.setObject("dijit.GeoAddressTooltip", Widget, esriNS);
    }
    return Widget;
});
