/**
 * Copyright (c) 2009
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
 * Transforms a BPMNplus diagram to its XPDL4Chor representation and
 * calls a transformation web service to generate BPEL4Chor from the XPDL4Chor
 * representation.
 */
ORYX.Plugins.BPMN2XHTML = ORYX.Plugins.AbstractPlugin.extend({
	
	construct: function() {

		arguments.callee.$.construct.apply(this, arguments);
	
		this.facade.offer({
			'name'				: ORYX.I18N.BPMN2XHTML.XHTMLExport,
			'functionality'		: this.transform.bind(this),
			'group'				: ORYX.I18N.BPMN2XHTML.group,
            dropDownGroupIcon   : ORYX.PATH + "images/export2.png",
			'icon'				: ORYX.PATH + "images/page_white_world.png",
			'description'		: ORYX.I18N.BPMN2XHTML.XHTMLExport,
			'index'				: 99998,
			'minShape'			: 0,
			'maxShape'			: 0
		});
		
		this.facade.offer({
			'name'				: ORYX.I18N.BPMN2XHTML.XHTMLExport,
			'functionality'		: this.showXHTML.bind(this),
			'group'				: ORYX.I18N.BPMN2XHTML.group,
            dropDownGroupIcon   : ORYX.PATH + "images/export2.png",
			'icon'				: ORYX.PATH + "images/report.png",			
			'description'		: ORYX.I18N.BPMN2XHTML.XHTMLExport,
			'index'				: 99999,
			'minShape'			: 0,
			'maxShape'			: 0
		});
			
	},

	showXHTML: function() {
//		var xslt		= ORYX.PATH + "xslt/BPMN2XHTML-extended.xslt"; 
//		var transformed = this.doTransform( this.getRDFFromDOM(), xslt );
//		var win = window.open("data:application/xhtml+xml," +
//				transformed, 
//				"_blank", 
//				"resizable=yes,width=640,height=480,toolbar=0,scrollbars=yes");
		
		//this.generateXHTML(this.openXMLWindow.bind(this));
		
		window.open("/oryx/testcase-BPMN2XHTML-extended.xhtml", "_blank", "resizable=yes,width=640,height=480,toolbar=0,scrollbars=yes");
	},

	generateXHTML: function( xhtmlHandleFunction ) {
		
		var loadMask = new Ext.LoadMask(Ext.getBody(), {msg:"Transforming BPMN to XHTML"});
		loadMask.show();
		
		var rdfString = this.getRDFFromDOM();
		this._sendRequest(
				'/oryx/bpmn2xhtml',
				'POST',
				{ 'data' : rdfString },
				function( arg ) { 
					xhtmlHandleFunction( arg );  
					loadMask.hide();
				}.bind(this),
				function() { 
					loadMask.hide(); 
					this._showErrorMessageBox("Oryx", ORYX.I18N.Bpmn2Bpel.transfFailed);
					ORYX.log.warn("Transformation to XHTML failed: " + transport.responseText);
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
					Ext.Msg.alert("Oryx", ORYX.I18N.Bpmn2Bpel.transfFailed);
					ORYX.log.warn("Transformation to XHTML failed: " + transport.responseText);	
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
		//var transformed = this.getRDFFromDOM();
		
		//this.openDownloadWindow( window.document.title + ".xml", transformed );
		
		//var win = window.open("data:text/xml," +
		var win = window.open("data:application/xhtml+xml," +
				transformed, 
				"_blank", 
				"resizable=yes,width=640,height=480,toolbar=0,scrollbars=yes");
		
	}
	
});
