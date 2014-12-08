/*jslint white: true nomen: true plusplus: true */
/*global logger, mx, mxui, mendix, dojo, require, console, define, module, formtooltip, dijit */
/**

	FormTooltip
	========================

	@file      : FormTooltip.js
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

        'mxui/widget/_WidgetBase', 'dijit/_Widget', 'dijit/_TemplatedMixin', 'mxui/widget/_MasterTooltip',
        'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-class', 'dojo/dom-style', 'dojo/on', 'dojo/_base/lang', 'dojo/_base/declare', 'dojo/text', 'dojo/dom-attr', 'dijit/registry'

    ], function (_WidgetBase, _Widget, _Templated, MasterTooltip, domMx, dom, domQuery, domProp, domGeom, domClass, domStyle, on, lang, declare, text, domAttr, registry) {
   
        // Declare widget.
        return declare('TooltipLink.widget.FormTooltip', [ _WidgetBase, _Widget, _Templated, MasterTooltip ], {

            baseClass            : 'formtooltipFormTooltip',

            // Template path
            templatePath: require.toUrl('TooltipLink/widget/templates/Tooltip.html'),

            tooltipNode          : null,
            prevContext	         : null,
            currentContext	     : null,
            topWidgets	         : null,
            showdelay	         : 1000,
            hidedelay	         : 1000,
            hideTimer	         : null,
            showTimer	         : null,
            currentState	     : false,
            
            _dataContainer       : {},

            postCreate : function() {
                logger.debug(this.id + ".postCreate");

                this.connect(this.targetnode, 'onmouseover', '_onShow');
                this.connect(this.targetnode, 'onmouseout', '_onHide');
                
                this.connect(mxui.widget, 'hideTooltip', this, '_hideTooltip');
                
                //_dataContainer
            },

            applyContext : function(context, callback) {
                logger.debug(this.id + ".applyContext");

                this.curContext = context;

                if (typeof callback !== 'undefined') {
                    callback();
                }
            },

            _onShow : function(e) {
                logger.debug(this.id + ".onShow");

                this.clearHideTimer();

                if(!this.curState) {
                    this.showTimer = setTimeout( lang.hitch(this, this._fetchForm) , this.showdelay);
                }
            },

            _onHide : function(e) {
                logger.debug(this.id + ".onHide");

                this.clearShowTimer();

                if(this.curState) {
                    this.hideTimer = setTimeout( lang.hitch(this, this._hideTooltip) , this.hidedelay);
                }
            },

            _fetchForm : function() {
                var node = null,
                    ioBind = null;
                
                logger.debug(this.id + '.fetchForm');

                
                if(this.topWidgets) {
                    this._showTooltip();
                } else {
                    node = mxui.dom.create('div');
                    ioBind = mx.ui.openForm(this.tooltipform, {
                        location: 'content',
                        domNode: node,
                        callback: lang.hitch(this, function(form) {
                            var i = null,
                                widget;
                            
                            this.tooltipNode = node.firstChild;
                            this.topWidgets = registry.findWidgets(this.tooltipNode);

                            this.topWidgets[0].set('disabled',true);

                            this.connect(this.tooltipNode, 'onmouseover', lang.hitch(this, this._onShow));
                            this.connect(this.tooltipNode, 'onmouseout', lang.hitch(this, this._onHide));

                            this._showTooltip();
                        } )
                    });
                }
            },

            _showTooltip : function() {
                logger.debug(this.id + '.showTooltip');
                this.curState = true;
                if(this.curContext !== this.prevContext) {
                    this._onShowTooltip(null, this.targetnode, this.position);
                    if(typeof this.topWidgets.applyContext !== 'undefined') {
                        this.topWidgets.applyContext(this.curContext, lang.hitch(this, function() {
                            if(this.curState) {
                                this.prevContext = this.curContext;
                                this._onShowTooltip(this.tooltipNode, this.targetnode, this.position, this.cssclass);
                            }
                        }));
                    }
                    this._onShowTooltip(this.tooltipNode, this.targetnode, this.position, this.cssclass);
                } else {
                    this._onShowTooltip(this.tooltipNode, this.targetnode, this.position, this.cssclass);
                }
            },
            _onShowTooltip : function(content, aroundNode, position, cssclass) {
                if(!this._masterTT){ this._masterTT = new MasterTooltip(); }
                this._masterTT.show(content, aroundNode, position, cssclass);
            },

            _hideTooltip : function() {
                logger.debug(this.id + '.hideTooltip');
                this.curState = false;
                this._onHideTooltip(this.targetnode);
            },
            _onHideTooltip : function(aroundNode) {
                if(!this._masterTT){ this._masterTT = new MasterTooltip(); }
                if(aroundNode === null){ aroundNode = this._masterTT.currentNode; }
                this._masterTT.hide(aroundNode);
            },

            clearShowTimer : function() {
                logger.debug(this.id + '.clearShowTimer');

                if(this.showTimer !== null) {
                    clearTimeout(this.showTimer);
                    this.showTimer = null;
                }
            },

            clearHideTimer : function() {
                logger.debug(this.id + '.clearHideTimer');

                if(this.hideTimer !== null) {
                    clearTimeout(this.hideTimer);
                    this.hideTimer = null;
                }
            },

            uninitialize : function() {
                logger.debug(this.id + '.uninitialize');

                if (typeof this.tooltipNode !== 'undefined' && this.tooltipNode) {
                    mxui.widget.destroyChildren(this.tooltipNode);
                }
            }
            
        });
        
    });
    
    
}());