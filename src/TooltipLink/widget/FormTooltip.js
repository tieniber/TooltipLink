/*jslint white: true, nomen: true, plusplus: true */
/*global logger, mx, mxui, mendix, dojo, require, console, define, module, formtooltip, dijit, setTimeout, clearTimeout */
/**

	FormTooltip
	========================

	@file      : FormTooltip.js
	@version   : 2.0
	@author    : Gerhard Richard Edens
	@date      : Thursday, December 4, 2014
	@copyright : Mendix Technology BV
	@license   : Apache License, Version 2.0, January 2004

	Documentation
    ========================
	Describe your widget here.

*/

define([
	"dojo/_base/declare", "mxui/widget/_WidgetBase", "dijit/_TemplatedMixin", "TooltipLink/widget/MasterTooltip",
	"mxui/dom", "dojo/dom", "dojo/query", "dojo/dom-prop", "dojo/dom-geometry", "dojo/dom-class", "dojo/dom-style",
	"dojo/on", "dojo/_base/lang", "dojo/text", "dojo/dom-attr", "dijit/registry",
	"dojo/text!TooltipLink/widget/templates/Tooltip.html", "TooltipLink/lib/jquery-1.11.2"
], function (declare, _WidgetBase, _TemplatedMixin, MasterTooltip, domMx, dom, domQuery, domProp, domGeom, domClass, domStyle, on, lang, text, domAttr, registry, widgetTemplate, _jQuery) {
	"use strict";

    var $ = _jQuery.noConflict(true);

	// Declare widget.
	return declare("TooltipLink.widget.FormTooltip", [ _WidgetBase, _TemplatedMixin, MasterTooltip ], {

		baseClass            : "formtooltipFormTooltip",

		// Template path
		templateString		 : widgetTemplate,

		// External variables with default settings
		cssclass	         : "",
		position	         : "",
		targetnode	         : "",
		targetnodeCSS		 : "", //must be within the same parent
		tooltipform	         : "",
		tooltipmode			 : "hover",
		tooltippos			 : "",
		showdelay	         : 0,
		hidedelay            : 0,
		targetToggleClass	 : null,
		targetnodesubCSS	 : "",
		showIfEmpty			 : false,



		// Internal variables used.
		_hideTimer	         : null,
		_showTimer	         : null,
		_tooltipNode         : null,
		_previousContext	 : null,
		_currentContext	     : null,
		_topWidgets	         : null,
		_hideListener		 : null,

		_dataContainer       : {},

		_visible			 : false,

		postCreate : function() {
			logger.debug(this.id + ".postCreate");

			if (this.position === "") {
				switch(this.tooltippos) {
                    case "below":
                        this.position = ["below", "above"];
                        break;
                    case "above":
                        this.position = ["above", "below"];
                        break;
                    case "after":
                        this.position = ["after", "before"];
                        break;
                    case "before":
                        this.position = ["before", "after"];
                        break;
                }
			}

			if (this.targetnode === "") {
					this.targetnode = $(this.domNode.parentNode).find(this.targetnodeCSS)[0];
			}

			if (this.tooltipmode === "hover") {
				this.connect(this.targetnode, "onmouseover", "_onShow");
				this.connect(this.targetnode, "onmouseout", "_onHide");
			} else {
				this.connect(this.targetnode, "onclick", "_onToggle");
			}

			this.connect(mxui.widget, "hideTooltip", this, "_hideTooltip");
		},

		applyContext : function(context, callback) {
			logger.debug(this.id + ".applyContext");

			this._currentContext = context;

			if (typeof callback !== "undefined") {
				callback();
			}
		},

		uninitialize : function() {
			logger.debug(this.id + ".uninitialize");

			this._onHide();
			//be sure to destroy the master tooltip
			if (this._masterTT && this._masterTT.domNode) {
				var toRemove = this._masterTT.domNode;
				toRemove.parentNode.removeChild(toRemove);
			}

			//if (typeof this._tooltipNode !== "undefined" && this._tooltipNode) {
			//	widget.destroyChildren(this._tooltipNode);
			//}
		},

		_onShow : function(e) {
			logger.debug(this.id + ".onShow");

			this._clearHideTimer();

			if(!this._currentState) {
				this._showTimer = setTimeout(lang.hitch(this, this._fetchForm) , this.showdelay);
			}

			this._visible = true;
		},

		_onSomeClick : function(e) {
		 	if (!$(e.target).closest(this._tooltipNode).length) {
				this.disconnect(this._hideListener);
				this._onHide(e);
			}
		},

		_onHide : function(e) {
			logger.debug(this.id + ".onHide");

			this._clearShowTimer();

			if(this._currentState) {
				this._hideTimer = setTimeout(lang.hitch(this, this._hideTooltip) , this.hidedelay);
			}

			this._visible = false;
		},

		_onToggle : function(e) {
			var target = e.target || e.srcElement;
			var shouldContinue = true;

			//Don't show the popover if the click target does not match the sub-selector
            if(this.targetnodesubCSS &&
               this.targetnodesubCSS != "" &&
               $.inArray(target, $(this.targetnode).find(this.targetnodesubCSS)) === -1) {
                       shouldContinue = false;
             }

			//Don't show the popover if the cell contents are empty
			if (!this.showIfEmpty) {
				if(this.targetnodesubCSS &&
				   this.targetnodesubCSS != "" &&
				   !$(this.targetnode).find(this.targetnodesubCSS).text().trim()) {
						shouldContinue = false;
				} else if(!$(this.targetnode).text().trim()) {
					shouldContinue = false;
				}
			}

			if (shouldContinue) {
				if (this._visible) {
					this._onHide(e);
				} else {
					this._onShow(e);
				}
			}
		},

		_fetchForm : function() {
			var node = null,
				ioBind = null;

			logger.debug(this.id + ".fetchForm");

			if(this._topWidgets) {
				this._showTooltip();
			} else {
				node = mxui.dom.create("div");
				ioBind = mx.ui.openForm(this.tooltipform, {
					location: "content",
					domNode: node,
					callback: lang.hitch(this, function(form) {
						var i = null,
							widget;

						this._tooltipNode = node.firstChild;
						this._topWidgets = registry.findWidgets(this._tooltipNode)[0];

						if(this._topWidgets) {
							this._topWidgets.set("disabled",true);
						}

						//this.connect(this._tooltipNode, "onmouseover", lang.hitch(this, this._onShow));
						//this.connect(this._tooltipNode, "onmouseout", lang.hitch(this, this._onHide));

						//this._hideListener = this.connect(document, "onclick", lang.hitch(this, this._onSomeClick));

						this._showTooltip();
					} )
				});
			}
		},

		_showTooltip : function() {
			logger.debug(this.id + ".showTooltip");
			this._currentState = true;
			this._hideListener = this.connect(document, "onclick", lang.hitch(this, this._onSomeClick));

			if(this._currentContext !== this._previousContext) {
				this._onShowTooltip(null, this.targetnode, this.position, this.cssclass);
				if(typeof this._topWidgets.applyContext !== "undefined") {
					this._topWidgets.applyContext(this._currentContext, lang.hitch(this, function() {
						if(this._currentState) {
							this._previousContext = this._currentContext;
							this._onShowTooltip(this._tooltipNode, this.targetnode, this.position, this.cssclass);
						}
					}));
				}
				this.
				_onShowTooltip(this._tooltipNode, this.targetnode, this.position, this.cssclass);
			} else {
				this._onShowTooltip(this._tooltipNode, this.targetnode, this.position, this.cssclass);
			}
		},
		_onShowTooltip : function(content, aroundNode, position, cssclass) {
			if(!this._masterTT){
				this._masterTT = new MasterTooltip();
			}
			this._masterTT.show(content, aroundNode, position, null);

			if (cssclass) {
				domClass.add(this._masterTT.domNode, cssclass);
			}

			//add a class to the form target
			if(this.targetToggleClass && this.targetToggleClass != "") {
				$(this.targetnode).addClass(this.targetToggleClass);
			}
		},

		_hideTooltip : function() {
			logger.debug(this.id + ".hideTooltip");
			this._currentState = false;
			this._onHideTooltip(this.targetnode);
		},
		_onHideTooltip : function(aroundNode) {
			if(!this._masterTT){ this._masterTT = new MasterTooltip(); }
			if(aroundNode === null){ aroundNode = this._masterTT.currentNode; }
			this._masterTT.hide(aroundNode);

			//remove a class to the form target
			if(this.targetToggleClass && this.targetToggleClass != "") {
				$(this.targetnode).removeClass(this.targetToggleClass);
			}
		},

		_clearShowTimer : function() {
			logger.debug(this.id + ".clearShowTimer");

			if(this._showTimer !== null) {
				clearTimeout(this._showTimer);
				this._showTimer = null;
			}
		},

		_clearHideTimer : function() {
			logger.debug(this.id + ".clearHideTimer");

			if(this._hideTimer !== null) {
				clearTimeout(this._hideTimer);
				this._hideTimer = null;
			}
		}

	});

});
require(["TooltipLink/widget/FormTooltip"], function () {
	"use strict";
});
