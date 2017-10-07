/*!
 * BackBlur.js v1.0.0-dev
 * 
 * Copyright 2017 Alexis Cheron
 * Licensed under MIT (https://github.com/Norech/BackBlur.js/blob/master/LICENSE)
 */
"use strict";
var BackBlur = (function () {
    /**
     * BackBlur helper functions
     *
     * @internal
     */
    var Helper = /** @class */ (function () {
        function Helper() {
        }
        /**
         * Get all HTML elements found by a CSS selector.
         * @param selector CSS selector
         */
        Helper.getAllBySelector = function (selector) {
            return Helper.arrayOf(document.querySelectorAll(selector));
        };
        /**
         * Get first HTML element found by a CSS selector.
         * @param selector CSS selector
         */
        Helper.getBySelector = function (selector) {
            return document.querySelector(selector);
        };
        /**
         * Convert an array-like object to array.
         * @param element Element to convert
         */
        Helper.arrayOf = function (element) {
            return Array.prototype.slice.call(element);
        };
        /**
         * Check if color is valid.
         * @param string Color string
         */
        Helper.isValidColor = function (string) {
            return /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))$/.test(string);
        };
        /**
         * Check if a CSS class name is valid.
         * @param string Class name string
         */
        Helper.isValidCSSClassName = function (string) {
            return /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*\s*$/.test(string);
        };
        /**
         * Add an event listener.
         * @param object Object who owns event listener
         * @param type Event to listen
         * @param callback Function to call
         */
        Helper.addEvent = function (object, type, callback) {
            if (object == null || typeof (object) == 'undefined')
                return;
            if (object.addEventListener) {
                object.addEventListener(type, callback, false);
            }
            else if (object.attachEvent) {
                object.attachEvent("on" + type, callback);
            }
            else {
                object["on" + type] = callback;
            }
        };
        /**
         * Check and update settings.
         * @param usersettings User-provided settings
         * @param settings Default settings
         */
        Helper.checkSettings = function (usersettings, settings) {
            if (typeof usersettings === "undefined")
                usersettings = {};
            if (typeof usersettings !== "object")
                throw new TypeError("BackBlur - The settings argument must be an object.");
            Object.keys(settings).forEach(function (key) {
                if (typeof usersettings[key] != "undefined") {
                    settings[key] = usersettings[key];
                }
            });
            return settings;
        };
        return Helper;
    }());
    /**
     * BackBlur class
     *
     * @class
     */
    return /** @class */ (function () {
        /**
         * Create a new BackBlur.
         * @param settings Settings object
         */
        function BackBlur(settings) {
            this.settings = [];
            this.elements = [];
            this.tmpName = '';
            this.settings = Helper.checkSettings(settings, {
                selector: ".backblur",
                background_color: 'rgba(255, 255, 255, 0.65)',
                apply_zindex: true,
                blur_radius: 15,
                tmp_prefix: '__BACKBLUR',
                cache: true
            });
            if (!Helper.isValidCSSClassName(this.settings.tmp_prefix || ""))
                throw new Error("BackBlur - \"" + this.settings.tmp_prefix + "\" is not a valid name.");
            this.tmpName = this.settings.tmp_prefix + "_" + Math.floor(Math.random() * 9999999);
            Helper.addEvent(window, 'resize', this.update);
            this.update();
        }
        /**
         * Select elements to apply blur effect.
         */
        BackBlur.prototype.getElements = function () {
            var selector = this.settings.selector;
            var getAllBySelector = Helper.getAllBySelector;
            if (typeof selector === 'string') {
                if (!this.settings.cache) {
                    return getAllBySelector(selector);
                }
                else if (this.elements.length == 0) {
                    this.elements = getAllBySelector(selector);
                }
                return this.elements;
            }
            else if (Object.prototype.toString.call(selector) === '[object Array]') {
                return selector;
            }
            else
                return [selector];
        };
        /**
         * Clear the cache
         */
        BackBlur.prototype.clearCache = function () {
            if (this.settings.cache == true)
                this.elements = [];
        };
        /**
         * Updates the blurs.
         */
        BackBlur.prototype.update = function () {
            this.clear();
            this.draw();
        };
        /**
         * Clears the styles.
         */
        BackBlur.prototype.clear = function () {
            Helper.getAllBySelector("*[class*='" + this.tmpName + "_']").forEach(function (item) {
                if (item.parentNode != null)
                    item.parentNode.removeChild(item);
            });
        };
        /**
         * Draws the blurs.
         */
        BackBlur.prototype.draw = function () {
            var _this = this;
            var css = '';
            var elements = this.getElements();
            var settings = this.settings;
            elements.forEach(function (element) {
                var parent;
                if (element.hasAttribute("data-backblur-parent")) {
                    parent = Helper.getBySelector(element.getAttribute("data-backblur-parent"));
                }
                else
                    parent = element.parentElement;
                if (parent != null) {
                    var bStyle = '';
                    var aStyle = '';
                    var element_class = _this.tmpName + '_' + Math.floor(Math.random() * 9999999);
                    var parent_computed = document.defaultView.getComputedStyle(parent, undefined);
                    var blur_radius = parseFloat(settings.blur_radius.toString());
                    element.className += ' ' + element_class;
                    aStyle += "content: \"\";";
                    if (settings.apply_zindex) {
                        aStyle += "z-index: 0;";
                    }
                    aStyle += "filter: blur(" + blur_radius + "px);";
                    aStyle += "position: absolute;";
                    aStyle += "top: " + (parent.offsetTop - element.offsetTop) + "px;";
                    aStyle += "left: " + (parent.offsetLeft - element.offsetLeft) + "px;";
                    aStyle += "right: " + ((element.offsetLeft + element.offsetWidth) - (parent.offsetLeft + parent.offsetWidth)) + "px;";
                    aStyle += "bottom: " + ((element.offsetTop + element.offsetHeight) - (parent.offsetTop + parent.offsetHeight)) + "px;";
                    ["background-image", "background-position", "background-size", "background-repeat",
                        "background-attachment", "background-origin", "background-clip", "background-color"]
                        .forEach(function (prop) {
                        aStyle += prop + ": " + parent_computed.getPropertyValue(prop) + ";";
                    });
                    if (!Helper.isValidColor(settings.background_color))
                        throw new Error("BackBlur - \"" + settings.background_color + "\" is not a valid color.");
                    bStyle += "content: '';";
                    if (settings.apply_zindex) {
                        bStyle += "z-index: 0;";
                    }
                    bStyle += "background: " + settings.background_color + ";";
                    bStyle += "position: absolute;";
                    bStyle += "left: 0px;";
                    bStyle += "top: 0px;";
                    bStyle += "bottom: 0px;";
                    bStyle += "right: 0px;";
                    css += "." + element_class + "::before{" + aStyle + "}";
                    css += "." + element_class + "::after{" + bStyle + "}";
                    if (settings.apply_zindex) {
                        css += "." + element_class + " *{position:relative;z-index:1;}";
                    }
                }
            });
            document.head.insertAdjacentHTML('beforeend', "<style id=\"" + this.tmpName + "_STYLE\">" + css + "</style>");
        };
        return BackBlur;
    }());
})();
