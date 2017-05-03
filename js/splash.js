define([
    "dojo/Evented", "dojo/_base/declare", "dojo/_base/window", "dojo/_base/fx",
    "dojo/_base/html", "dojo/_base/lang", "dojo/has", "dojo/dom",
    "dojo/dom-class", "dojo/dom-style", "dojo/dom-attr", "dojo/dom-construct", "dojo/dom-geometry",
    "dojo/on", "dojo/mouse", "dojo/query", "dojo/Deferred"], function (
Evented, declare, win, fx, html, lang, has, dom,
domClass, domStyle, domAttr, domConstruct, domGeometry,
on, mouse, query, Deferred) {
    return declare([Evented], {

        constructor: function (config) {
            this.config = config;
            this.overlayNode = domConstruct.create('div', {
                id: 'loadingOverlay',
                'class': 'loadingOverlay pageOverlay',
                innerHTML: '<div class="loadingMessage"> Loading...</div>'
              }, win.body());
        },

        show: function(){
            // Show the overlay
            domStyle.set(this.overlayNode, {
              display: 'block'
            });
            console.log("Show splash");
        },

        hide: function(){
            // Hide the overlay
            domStyle.set(this.overlayNode, {
              display: 'none'
            });
            console.log("Hide splash");
        },

        _init: function () {
            console.log("Splash initialization");
        }

    });
});
