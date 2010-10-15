/**
 * Copyright (c) 2008-2009
 * Falko Menge
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

/**
 * Aggregates an XForms user interface based on an annotated BPMN model
 */
ORYX.Plugins.BPMN2XForms = ORYX.Plugins.AbstractPlugin.extend({
	
	stencilSetExtensionSuffix: '/bpmn-xforms-user-interfaces#',

	construct: function() {

		arguments.callee.$.construct.apply(this, arguments);
	
		this.facade.offer({
			'name'				: "Aggregate User Interface",
			'functionality'		: this.aggregateUI.bind(this),
			'group'				: "User Interface Generation",
            dropDownGroupIcon   : ORYX.PATH + "images/bpmn2xforms.png",
			'icon'				: ORYX.PATH + "images/page_world.png",
			'description'		: "Aggregates an XForm out of BPMN (requires 'BPMN Extension for XForms User Interfaces')",
			'index'				: 1,
			'minShape'			: 0,
			'maxShape'			: 0//,
//			'isEnabled'			: this.isStencilSetExtensionLoaded.bind(this)
		});

/*
		this.facade.offer({
			'name'				: "Aggregate User Interface and render in Orbeon",
			'functionality'		: this.aggregateUIAndRenderInOrbeon.bind(this),
			'group'				: "User Interface Generation",
            dropDownGroupIcon   : ORYX.PATH + "images/bpmn2xforms.png",
			'icon'				: ORYX.PATH + "images/xforms_orbeon_export.png",
			'description'		: "Aggregates an XForm out of BPMN (requires 'BPMN Extension for XForms User Interfaces')",
			'index'				: 2,
			'minShape'			: 0,
			'maxShape'			: 0//,
//			'isEnabled'			: this.isStencilSetExtensionLoaded.bind(this)
		});
*/

		this.facade.offer({
			'name'				: "Save Aggregated User Interface",
			'functionality'		: this.saveAggregatedUI.bind(this),
			'group'				: "User Interface Generation",
            dropDownGroupIcon   : ORYX.PATH + "images/bpmn2xforms.png",
			'icon'				: ORYX.PATH + "images/page_save.png",
			'description'		: "Aggregates an XForm out of BPMN and stores it on the server (requires 'BPMN Extension for XForms User Interfaces')",
			'index'				: 3,
			'minShape'			: 0,
			'maxShape'			: 0//,
//			'isEnabled'			: this.isStencilSetExtensionLoaded.bind(this)
		});
		
		this.facade.offer({
			'name'				: "Browse Saved User Interfaces",
			'functionality'		: this.browseAggregatedUIs.bind(this),
			'group'				: "User Interface Generation",
            dropDownGroupIcon   : ORYX.PATH + "images/bpmn2xforms.png",
			'icon'				: ORYX.PATH + "images/folder_page.png",
			'description'		: "Opens a list of Aggregated User Interfaces that are stored on the server.",
			'index'				: 4,
			'minShape'			: 0,
			'maxShape'			: 0//,
//			'isEnabled'			: this.isStencilSetExtensionLoaded.bind(this)
		});
		
			
	},

	aggregateUI: function() {
		this.invokeBPMN2XFormsServlet(ORYX.CONFIG.ROOT_PATH + 'bpmn2xforms', this.openXMLWindow.bind(this));
	},

	aggregateUIAndRenderInOrbeon: function() {
		this.invokeBPMN2XFormsServlet(ORYX.CONFIG.ROOT_PATH + 'bpmn2xforms-orbeon', this.openOrbeonWindow.bind(this));
	},

	saveAggregatedUI: function() {
		this.invokeBPMN2XFormsServlet(ORYX.CONFIG.ROOT_PATH + 'bpmn2xforms?save=true', window.open.bind(window));
	},

	browseAggregatedUIs: function() {
		window.open("/oryx/generated-uis/", "_blank", "resizable=yes,width=640,height=480,toolbar=0,scrollbars=yes");
	},

	openOrbeonWindow: function(content) {
		var win = window.open(
		   'data:application/xml,' + encodeURIComponent(
		     content
		   ),
		   '_blank', "resizable=yes,width=600,height=600,toolbar=0,scrollbars=yes"
		);
	},

	invokeBPMN2XFormsServlet: function( servletURL, xhtmlHandleFunction ) {
		
		var loadMask = new Ext.LoadMask(Ext.getBody(), {msg:"Aggregating User Interface..."});
		loadMask.show();
		
		var rdfString = this.getRDFFromDOM();
		this._sendRequest(
				servletURL,
				'POST',
				{ 'data' : rdfString },
				function( arg ) { 
					xhtmlHandleFunction( arg );  
					loadMask.hide();
				}.bind(this),
				function() { 
					loadMask.hide(); 
					this._showErrorMessageBox("Oryx", "User Interface Aggregation failed.");
					ORYX.log.warn("User Interface Aggregation failed: " + transport.responseText);
				}.bind(this)
			);
	},

	_sendRequest: function( url, method, params, successcallback, failedcallback ){

		var suc = false;

		new Ajax.Request(url, {
           method			: method,
           asynchronous	: false,
           parameters		: params,
		   onSuccess		: function(transport) {
				
				suc = true;
				
				if(successcallback){
					successcallback( transport.responseText );
				}
				
			}.bind(this),
			
			onFailure : function(transport) {

				if(failedcallback){
					failedcallback();
					
				} else {
					Ext.Msg.alert("Oryx", "User Interface Aggregation failed.");
					ORYX.log.warn("User Interface Aggregation failed: " + transport.responseText);	
				}
				
			}.bind(this)		
		});
		
		return suc;		
	},
	
	_showErrorMessageBox: function(title, msg){
        Ext.MessageBox.show({
           title: title,
           msg: msg,
           buttons: Ext.MessageBox.OK,
           icon: Ext.MessageBox.ERROR
       });
	},

	// unused: only XHTML without interaction diagram
	transform: function() {		

		var xslt		= ORYX.PATH + "xslt/BPMN2XHTML.xslt"; 
		var transformed = this.doTransform( this.getRDFFromDOM(), xslt );
		
		//this.openDownloadWindow( window.document.title + ".xml", transformed );
		
		var win = window.open("data:application/xhtml+xml," +
				transformed, 
				"_blank", 
				"resizable=yes,width=640,height=480,toolbar=0,scrollbars=yes");
		
	},
	
	isStencilSetExtensionLoaded: function() {
		return this.facade.getStencilSets().values().any(
			function(ss){ 
				return ss.extensions().keys().any(
					function(extensionKey) {
						return extensionKey.endsWith(this.stencilSetExtensionSuffix);
					}.bind(this)
				);
			}.bind(this)
		);
	}

});
