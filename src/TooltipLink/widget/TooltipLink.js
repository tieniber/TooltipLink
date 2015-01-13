/*jslint white: true nomen: true plusplus: true */
/*global logger, mx, mxui, mendix, dojo, require, console, define, module, TooltipLink */
/**

	TooltipLink
	========================

	@file      : TooltipLink.js
	@version   : 1.0
	@author    : Gerhard Richard Edens
	@date      : Thursday, December 4, 2014
	@copyright : Mendix Technology BV
	@license   : Apache License, Version 2.0, January 2004

	Documentation
    ========================
	Describe your widget here.

*/

(function() {
    'use strict';
    
    // test
    require([

        'mxui/widget/_WidgetBase', 'dijit/_Widget', 'dijit/_TemplatedMixin',
        'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-class', 'dojo/dom-style', 'dojo/on', 'dojo/_base/lang', 'dojo/_base/declare', 'dojo/text',
        'TooltipLink/widget/FormTooltip'

    ], function (_WidgetBase, _Widget, _Templated, domMx, dom, domQuery, domProp, domGeom, domClass, domStyle, on, lang, declare, text) {

        // Declare widget.
        return declare('TooltipLink.widget.TooltipLink', [ _WidgetBase, _Widget, _Templated ], {

            /**
             * Internal variables.
             * ======================
             */
            baseClass		: "formtooltipTooltipLink",
            
            // Template path
            templatePath: require.toUrl('TooltipLink/widget/templates/TooltipLink.html'),
            
            // Extra variables
            _dataContent    : {},
           
            /**
             * Mendix Widget methods.
             * ======================
             */

            // PostCreate is fired after the properties of the widget are set.
            postCreate : function() {

                var position = null;
                
                this._dataContent[this.id] = {
                    _tooltip		: null,
                    _contextObj     : null
                };
                
                logger.debug(this.id + ".postCreate");

                this.domNode.innerHTML = '<a href="#" id="' + this.id + '_lnk">' + this.linktext + '</a>';
                this.connect(this.domNode, "click", this.onClick);

                switch(this.tooltippos) {
                    case "below":
                        position = ["below", "above"];
                        break;
                    case "above":
                        position = ["above", "below"];
                        break;
                    case "after":
                        position = ["after", "before"];
                        break;
                    case "before":
                        position = ["before", "after"];
                        break;
                }

                // Create form tooltip
                this._dataContent[this.id]._tooltip = new TooltipLink.widget.FormTooltip({
                    cssclass	: this.cssclass,
                    position	: position,
                    targetnode	: domQuery('#' + this.id + '_lnk')[0],
                    tooltipform	: this.tooltipform,
                    showdelay	: 0,
                    hidedelay   : 0
                });
            },

            /**
             * What to do when the apply context is done?
             */
            applyContext : function(context, callback) {
                logger.debug(this.id + ".applyContext");

                this._dataContent[this.id]._contextObj = context;
                
                if (typeof this._dataContent[this.id]._tooltip !== 'undefined' && this._dataContent[this.id]._tooltip !== null) {
                    
                    this._dataContent[this.id]._tooltip.applyContext(context, lang.hitch(this, function(callback) {
                        
                        if (typeof callback !== 'undefined'){
                            callback();
                        }
                        
                    }, callback));
                                                                     
                } else {
                     
                    if (typeof callback !== 'undefined'){
                        callback();
                    }
                    
                }
            },
            
            /**
             * What to do when data is loaded?
             */
            update: function (context, callback) {
                logger.debug(this.id + ".update");

                this._dataContent[this.id]._contextObj = context;
                
                if (typeof this._dataContent[this.id]._tooltip !== 'undefined' && this._dataContent[this.id]._tooltip !== null) {
                    
                    this._dataContent[this.id]._tooltip.applyContext(context, lang.hitch(this, function(callback) {
                        
                        if (typeof callback !== 'undefined'){
                            callback();
                        }
                        
                    }, callback));
                                                                     
                } else {
                       
                    if (typeof callback !== 'undefined'){
                        callback();
                    }
                    
                }
            },

            onClick : function(e) {
                logger.debug(this.id + ".onClick");

                dojo.stopEvent(e);
            },

            uninitialize : function() {
                logger.debug(this.id + ".uninitialize");

                if (typeof this._dataContent[this.id]._tooltip !== 'undefined' && this._dataContent[this.id]._tooltip !== null){
                    this._dataContent[this.id]._tooltip.destroy();
                }
            }
        });
    });
    
}());
