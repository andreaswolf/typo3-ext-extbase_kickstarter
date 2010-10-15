/**
 * Copyright (c) 2009
 * Stefan Krumnow
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

ORYX.Plugins.BPMN2BPEL = ORYX.Plugins.AbstractPlugin.extend({
	
	bpmn2BpelHandlerUrl: "/oryx/bpmn2bpel",
	
	stencilSetExtensionSuffix: '/bpmnservicecompositionsubset-goldeneye#',
	
	construct: function(facade) {
	
		this.facade = facade;
	
		this.facade.offer({
			'name'				: ORYX.I18N.Bpmn2Bpel.show,
			'functionality'		: this.showBpel.bind(this),
			'group'				: ORYX.I18N.Bpmn2Bpel.group,
            dropDownGroupIcon   : ORYX.PATH + "images/bpmn2bpel_icon.png",
			'description'		: ORYX.I18N.Bpmn2Bpel.showDesc,
			'index'				: 0,
			'minShape'			: 0,
			'maxShape'			: 0,
			'isEnabled': 		this.isStencilSetExtensionLoaded.bind(this)
		});
		
		this.facade.offer({
			'name'				: ORYX.I18N.Bpmn2Bpel.download,
			'functionality'		: this.downloadBpel.bind(this),
			'group'				: ORYX.I18N.Bpmn2Bpel.group,
            dropDownGroupIcon   : ORYX.PATH + "images/bpmn2bpel_icon.png",
			'description'		: ORYX.I18N.Bpmn2Bpel.downloadDesc,
			'index'				: 0,
			'minShape'			: 0,
			'maxShape'			: 0,
			'isEnabled': 		this.isStencilSetExtensionLoaded.bind(this)
		});
		
		this.facade.offer({
			'name'				: ORYX.I18N.Bpmn2Bpel.deploy,
			'functionality'		: this.deployBpel.bind(this),
			'group'				: ORYX.I18N.Bpmn2Bpel.group,
            dropDownGroupIcon   : ORYX.PATH + "images/bpmn2bpel_icon.png",
			'description'		: ORYX.I18N.Bpmn2Bpel.deployDesc,
			'index'				: 0,
			'minShape'			: 0,
			'maxShape'			: 0,
			'isEnabled': 		this.isStencilSetExtensionLoaded.bind(this)
		});
		
			
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
	},

	showBpel: function() {	
		var options = JSON.stringify({action : 'transform'});
		
		this.generateBpel( function( process ) {
			this.openXMLWindow(process.process);
		}.bind(this), options);
	},
	
	downloadBpel: function() {	
		var options = JSON.stringify({action : 'transform'});
		this.generateBpel(
			function ( process ) {
				this.openDownloadWindow("Oryx-BPEL", process.process);
			}.bind(this), options);
	},
	
	deployBpel: function() {
		this._showInputBox(
			function ( apacheOdeUrl ) {
				var options = {
					apacheOdeUrl : apacheOdeUrl,
					action : 'deploy'
				};
				options = JSON.stringify(options);
				this.generateBpel(this._showProcessUrl.bind(this), options);
			}.bind(this));
	},
	
	generateBpel: function( bpelHandleFunction, options ) {
		var loadMask = new Ext.LoadMask(Ext.getBody(), {msg:"Transforming BPMN to BPEL"});
		loadMask.show();
		
		var erdfString = this.getRDFFromDOM();
		this._sendRequest(
				this.bpmn2BpelHandlerUrl,
				'POST',
				{ 'data' : erdfString,
				  'options' : options },
				function( arg ) { 
					eval("var process = " + arg);
					bpelHandleFunction( process );  
					loadMask.hide();
				}.bind(this),
				function() { 
					loadMask.hide(); 
					this._showErrorMessageBox(ORYX.I18N.Oryx.title, ORYX.I18N.Bpmn2Bpel.transfFailed);
					ORYX.log.warn("Transformation to BPEL failed: " + transport.responseText);
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
					Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.Bpmn2Bpel.transfFailed);
					ORYX.log.warn("Transformation to BPEL failed: " + transport.responseText);	
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
	
	_showProcessUrl : function( processUrl ) {
		Ext.MessageBox.show({
           title: 'BPEL-Process-URL',
           msg: processUrl.serviceName,
           buttons: Ext.MessageBox.OK,
           icon: Ext.MessageBox.INFO
       });
	},
	
	_showInputBox : function( successCallback ) {
		
		// Create URL - InputField
		var urlInputField = new Ext.form.TextField({
			value : 'http://localhost:8080/ode',
			fieldLabel : 'URL',
			width : 200
		}
		);
		
		// Create a new Panel
        var panel = new Ext.FormPanel({
            items: [{
                xtype: 'label',
                text: ORYX.I18N.Bpmn2Bpel.ApacheOdeUrlInputPanelText,
                style: 'margin:10px;display:block'
            }, urlInputField],
            frame: true,
            buttons: [{
                text: ORYX.I18N.Bpmn2Bpel.ApacheOdeUrlInputLabelDeploy,
                handler: function(){
                    var url = urlInputField.getValue();
  					Ext.getCmp('oryx_ode_url_input_panel_window').close();
                    successCallback(url);
                }.bind(this)
            }, {
                text: ORYX.I18N.Bpmn2Bpel.ApacheOdeUrlInputLabelCancel,
                handler: function(){
                    Ext.getCmp('oryx_ode_url_input_panel_window').close();
                }.bind(this)
            }]
        })
		
		// Create a new Window
        var window = new Ext.Window({
            id: 'oryx_ode_url_input_panel_window',
            width: 350,
            title: ORYX.I18N.Bpmn2Bpel.ApacheOdeUrlInputTitle,
            floating: true,
            shim: true,
            modal: true,
            resizable: false,
            autoHeight: true,
            items: [panel]
        })
        
        // Show the window
        window.show();
	}
	
});


