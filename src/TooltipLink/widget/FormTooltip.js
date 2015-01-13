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

            // External variables with default settings
            cssclass	         : '',
            position	         : '',
            targetnode	         : '',
            tooltipform	         : '',
            showdelay	         : 0,
            hidedelay            : 0,
            
            // Internal variables used.
            _hideTimer	         : null,
            _showTimer	         : null,
            _tooltipNode         : null,
            _previousContext	 : null,
            _currentContext	     : null,
            _topWidgets	         : null,
            
            _dataContainer       : {},

            postCreate : function() {
                logger.debug(this.id + ".postCreate");

                this.connect(this.targetnode, 'onmouseover', '_onShow');
                this.connect(this.targetnode, 'onmouseout', '_onHide');
                
                this.connect(mxui.widget, 'hideTooltip', this, '_hideTooltip');
            },

            applyContext : function(context, callback) {
                logger.debug(this.id + ".applyContext");

                this._currentContext = context;

                if (typeof callback !== 'undefined') {
                    callback();
                }
            },
            
            uninitialize : function() {
                logger.debug(this.id + '.uninitialize');

                if (typeof this._tooltipNode !== 'undefined' && this._tooltipNode) {
                    mxui.widget.destroyChildren(this._tooltipNode);
                }
            },

            _onShow : function(e) {
                logger.debug(this.id + ".onShow");

                this._clearHideTimer();

                if(!this._currentState) {
                    this._showTimer = setTimeout( lang.hitch(this, this._fetchForm) , this.showdelay);
                }
            },

            _onHide : function(e) {
                logger.debug(this.id + ".onHide");

                this._clearShowTimer();

                if(this._currentState) {
                    this._hideTimer = setTimeout( lang.hitch(this, this._hideTooltip) , this.hidedelay);
                }
            },

            _fetchForm : function() {
                var node = null,
                    ioBind = null;
                
                logger.debug(this.id + '.fetchForm');

                if(this._topWidgets) {
                    this._showTooltip();
                } else {
                    node = mxui.dom.create('div');
                    ioBind = mx.ui.openForm(this.tooltipform, {
                        location: 'content',
                        domNode: node,
                        callback: lang.hitch(this, function(form) {
                            var i = null,
                                widget;
                            
                            this._tooltipNode = node.firstChild;
                            this._topWidgets = registry.findWidgets(this._tooltipNode)[0];

                            this._topWidgets.set('disabled',true);

                            this.connect(this._tooltipNode, 'onmouseover', lang.hitch(this, this._onShow));
                            this.connect(this._tooltipNode, 'onmouseout', lang.hitch(this, this._onHide));

                            this._showTooltip();
                        } )
                    });
                }
            },

            _showTooltip : function() {
                logger.debug(this.id + '.showTooltip');
                this._currentState = true;
                if(this._currentContext !== this._previousContext) {
                    this._onShowTooltip(null, this.targetnode, this.position);
                    if(typeof this._topWidgets.applyContext !== 'undefined') {
                        this._topWidgets.applyContext(this._currentContext, lang.hitch(this, function() {
                            if(this._currentState) {
                                this._previousContext = this._currentContext;
                                this._onShowTooltip(this._tooltipNode, this.targetnode, this.position, this.cssclass);
                            }
                        }));
                    }
                    this._onShowTooltip(this._tooltipNode, this.targetnode, this.position, this.cssclass);
                } else {
                    this._onShowTooltip(this._tooltipNode, this.targetnode, this.position, this.cssclass);
                }
            },
            _onShowTooltip : function(content, aroundNode, position, cssclass) {
                if(!this._masterTT){ this._masterTT = new MasterTooltip(); }
                this._masterTT.show(content, aroundNode, position, cssclass);
            },

            _hideTooltip : function() {
                logger.debug(this.id + '.hideTooltip');
                this._currentState = false;
                this._onHideTooltip(this.targetnode);
            },
            _onHideTooltip : function(aroundNode) {
                if(!this._masterTT){ this._masterTT = new MasterTooltip(); }
                if(aroundNode === null){ aroundNode = this._masterTT.currentNode; }
                this._masterTT.hide(aroundNode);
            },

            _clearShowTimer : function() {
                logger.debug(this.id + '.clearShowTimer');

                if(this._showTimer !== null) {
                    clearTimeout(this._showTimer);
                    this._showTimer = null;
                }
            },

            _clearHideTimer : function() {
                logger.debug(this.id + '.clearHideTimer');

                if(this._hideTimer !== null) {
                    clearTimeout(this._hideTimer);
                    this._hideTimer = null;
                }
            }
            
        });
        
    });
    
    
}());
