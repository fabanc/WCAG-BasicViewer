define([
    "dojo/Evented", "dojo/_base/declare", "dojo/_base/window", "dojo/_base/fx",
    "dojo/_base/html", "dojo/_base/lang", "dojo/has", "dojo/dom", "dojo",
    "dojo/dom-class", "dojo/dom-style", "dojo/dom-attr", "dojo/dom-construct", "dojo/dom-geometry",
    "dojo/on", "dojo/mouse", "dojo/query", "dojo/Deferred", "dijit/form/Button"], function (
Evented, declare, win, fx, html, lang, has, dom, dojo,
domClass, domStyle, domAttr, domConstruct, domGeometry,
on, mouse, query, Deferred, Button) {
    return declare([Evented], {

        content: "Loading...",
        overlayNode: null,

        constructor: function (config, srcNode) {
            this.config = config;
            this.overlayNode = srcNode;
            this._createOverlayNode(this.config.content || this.content);
        },

        _createOverlayNode: function(content){
            //Create the content of the splash screen
            var loadingOverlay = dom.byId('splashOverlay');
            domAttr.set('splashOverlay', 'class', 'loadingOverlay pageOverlay')

            //Set the div property. Take into account user options.
            loadingOverlay.style.backgroundColor = this.config.screenBackgroundColor || "White";

            //Compute the position of the splash screen on the screen
            var ratio = this.config.screenRatio || 75;
            var verticalMargin = (100-ratio) / 2 + "%";
            var horizontalMargin = (100-ratio) / 2 + "%";
            loadingOverlay.style.top = verticalMargin;
            loadingOverlay.style.left = horizontalMargin;
            loadingOverlay.style.height = ratio + "%";
            loadingOverlay.style.width = ratio + "%";

            //Attach the text to the overlay
            var loadingMessage = domConstruct.create('div', {
                id: 'splashMessage',
                'class': 'splashContentCommon splashText',
                innerHTML: content + '</br>'
            }, loadingOverlay);

            var closeButtonDiv = domConstruct.create('div', {
                id: 'splashButtonDiv',
                'class': 'splashContentCommon splashButton'
            }, loadingOverlay);

            //Add a button to the splash container
            var closeButton = new Button({
                label: "OK",
                'class': 'btn',
                onClick: dojo.hitch(this, function(){
                    this.hide();
                })
            });

            closeButton.startup();
            closeButton.placeAt(closeButtonDiv)

            return loadingOverlay;
        },

        show: function(){
            // Show the overlay
            if (!this.overlayNode){
                this.overlayNode = this._createOverlayNode(
                    this.config.content || this.content
                );
            }
            else{
                domAttr.set('splashOverlay', 'class', 'loadingOverlay pageOverlay')
            }
            console.log("Show splash");
        },

        hide: function(){
            // Hide the overlay
            // if (this.overlayNode){
            //     dojo.destroy(this.overlayNode)
            // }
            domAttr.set('splashOverlay', 'class', 'splahHidden')
            console.log("Hide splash");
        },

        _init: function () {
            console.log("Splash initialization");
        }

    });
});
