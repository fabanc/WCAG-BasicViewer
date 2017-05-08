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

        constructor: function (config) {
            this.config = config;
            this.overlayNode = this._createOverlayNode(this.config.content || this.content);
        },

        _createOverlayNode: function(content){

            //Create the overlay container
            var loadingOverlay = domConstruct.create('div', {
                id: 'splashOverlay',
                'class': 'loadingOverlay pageOverlay'
              }, win.body());

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
                'class': 'loadingMessage',
                innerHTML: content + '</br>'
            }, loadingOverlay);


            var closeButtonDiv = domConstruct.create('div',
                {id: 'splashButtonDiv'},
                loadingOverlay
            )
            closeButtonDiv.style.position = 'absolute';
            closeButtonDiv.style.display = 'table-cell';
            closeButtonDiv.style.width = '90%';
            closeButtonDiv.style.marginLeft = '5%';
            closeButtonDiv.style.marginRight = '5%';
            closeButtonDiv.style.bottom = '10px';
            closeButtonDiv.style.textAlign = 'right';

            //Add a button to the splash container
            var closeButton = new Button({
                label: "OK",
                'class': 'btn',
                onClick: dojo.hitch(this, function(){
                    this.hide();
                })
            });
            //closeButton.style.marginRight = '0%';

            closeButton.startup();
            closeButton.placeAt(closeButtonDiv)

            return loadingOverlay;
        },

        show: function(){
            // Show the overlay
            // domStyle.set(this.overlayNode, {
            //   display: 'block'
            // });
            if (!this.overlayNode){
                this.overlayNode = this._createOverlayNode(
                    this.config.content || this.content
                );
            }
            console.log("Show splash");
        },

        hide: function(){
            // Hide the overlay
            // domStyle.set(this.overlayNode, {
            //   display: 'none'
            // });
            if (this.overlayNode){
                dojo.destroy(this.overlayNode)
            }
            console.log("Hide splash");
        },

        _init: function () {
            console.log("Splash initialization");
        }



    });
});
