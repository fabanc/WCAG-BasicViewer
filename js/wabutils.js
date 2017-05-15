/*
 * Utility functions taken from the Web App Builder. Originally developed to
 * make the developement of the splash screen and the cookie management easier.
 * The module returns one instance and "static" functions. Since it is a Utility
 * module, there is no need to use the keyword "new".
*/

define([
    "dojo/Evented", "dojo/_base/declare", "dojo/_base/window", "dojo/_base/fx",
    "dojo/_base/html", "dojo/_base/lang", "dojo/has", "dojo/dom", "dojo",
    "dojo/dom-class", "dojo/dom-style", "dojo/dom-attr", "dojo/dom-construct",
    "dojo/on", "dojo/mouse", "dojo/query", "dojo/Deferred",
    "dojo/cookie", "esri/urlUtils", "esri/lang"], function (
    Evented, declare, win, fx, html, lang, has, dom, dojo,
    domClass, domStyle, domAttr, domConstruct,
    on, mouse, query, Deferred,
    cookie, esriUrlUtils, esriLang) {
    var statClass =  declare(null, {

        constructor: function(){
                console.debug("this is Demo object ");
        },

        /**
        * Utility function. Taken from Web App Builder
        * @return a string representing the app identifier.
        **/
        getAppIdFromUrl: function(){
            var isDeployedApp = true,
              href = window.top.location.href;
            if (href.indexOf("id=") !== -1 || href.indexOf("appid=") !== -1 ||
              href.indexOf("apps") !== -1) {
              isDeployedApp = false;
            }

            if (isDeployedApp === true) {
              // deployed app use pathname as key
              return href;
            } else {
              // xt or integration use id of app as key
              var urlParams = this.urlToObject(window.location.href);
              if (urlParams.query) {
                if (urlParams.query.id || urlParams.query.appid) {
                  return urlParams.query.id || urlParams.query.appid;
                }
              }

              // if there is no id/appid in url
              if (window.appInfo) {
                if (window.appInfo.id) {
                  //id in appInfo
                  return window.appInfo.id;
                } else if (window.appInfo.appPath) {
                  //parse id from appPath
                  var list = window.appInfo.appPath.split("/");
                  if (list.length && list.length > 2) {
                    return list[list.length - 2];
                  }
                } else {
                  console.error("CAN NOT getAppIdFromUrl");
                }
              }
          }
      },

      /**
      * Utility function. Taken from Web App Builder
      * @return object.
      **/
      urlToObject: function(url){
        var ih = url.indexOf('#'),
        obj = null;
        if (ih === -1){
          obj = esriUrlUtils.urlToObject(url);
          obj.hash = null;
        }else {
          var urlParts = url.split('#');
          obj = esriUrlUtils.urlToObject(urlParts[0]);
          obj.hash = urlParts[1] ?
            (urlParts[1].indexOf('=') > -1 ? ioQuery.queryToObject(urlParts[1]) : urlParts[1]): null;
        }
        return obj;
    },

    });

    return new statClass();
});
