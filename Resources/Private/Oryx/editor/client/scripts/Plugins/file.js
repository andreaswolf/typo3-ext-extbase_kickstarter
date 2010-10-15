/**
 * Copyright (c) 2006
 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner, Philipp Berger
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
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

ORYX.Plugins.Save = Clazz.extend({
	
    facade: undefined,
	
	processURI: undefined,
	
    construct: function(facade){
		this.facade = facade;
		
		this.facade.offer({
			'name': ORYX.I18N.Save.save,
			'functionality': this.save.bind(this,false),
			'group': ORYX.I18N.Save.group,
			'icon': ORYX.PATH + "images/disk.png",
			'description': ORYX.I18N.Save.saveDesc,
			'index': 1,
			'minShape': 0,
			'maxShape': 0
		});
		
		
		this.facade.offer({
			'name': ORYX.I18N.Save.saveAs,
			'functionality': this.save.bind(this,true),
			'group': ORYX.I18N.Save.group,
			'icon': ORYX.PATH + "images/disk_multi.png",
			'description': ORYX.I18N.Save.saveAsDesc,
			'index': 2,
			'minShape': 0,
			'maxShape': 0
		});	
		
		window.onbeforeunload = this.onUnLoad.bind(this);
	
		this.changeDifference = 0;
		
		// Register on event for executing commands --> store all commands in a stack		 
		// --> Execute
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE, function(){ this.changeDifference++ }.bind(this) );
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS, function(){ this.changeDifference++ }.bind(this) );
		// --> Rollback
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK, function(){ this.changeDifference-- }.bind(this) );
		
		//TODO very critical for load time performance!!!
		//this.serializedDOM = DataManager.__persistDOM(this.facade);
	},
	
	onUnLoad: function(){

		
		if( this.changeDifference !== 0 ){
		
			return ORYX.I18N.Save.unsavedData;
			
		}			
		
	},
		
	
    saveSynchronously: function(forceNew){
            
		// Reset changes
		this.changeDifference = 0;
		var reqURI ='';
		
		if (this.processURI) {
			reqURI = this.processURI;
		}
		else {
			if(!location.hash.slice(1)){
				reqURI= "/backend/poem/new";
			}
			else{
				reqURI = '/backend/poem/'+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/self";
			}
		}
		// If the  current url is the API-URL, try to find out the needed one.
		/* if( reqURI.endsWith("/api") || reqURI.include("/api?") ){
			// Parse params
			var params = {};
			window.location.search.slice(1).split("&").each(function(param){ params[param.split("=")[0]]=param.split("=")[1]})
			
			// If there is model in param, take this
			if(  params.model ){
				reqURI = window.location.href.split("/api")[0] + params.model + "/self";
			// If not, force to get a new one
			} else {
				forceNew = true;
			}
		}*/
		
		if(forceNew){
			var ss 		= this.facade.getStencilSets();
			var source 	= ss.get(ss.keys()[0]).source().split('stencilsets')[1];
	
			reqURI = '/backend/poem' + ORYX.CONFIG.ORYX_NEW_URL + "?stencilset=/stencilsets" + source ;		
		}


		// Get the serialized svg image source
        var svgClone 	= this.facade.getCanvas().getSVGRepresentation(true);
        var svgDOM 		= DataManager.serialize(svgClone);
		this.serializedDOM = Ext.encode(this.facade.getJSON());
		
		// Check if this is the NEW URL
		if( reqURI.include( ORYX.CONFIG.ORYX_NEW_URL ) ){
			
			// Get the stencilset
			var ss = this.facade.getStencilSets().values()[0]
		
			// Define Default values
			var defaultData = {title:ORYX.I18N.Save.newProcess, summary:'', type:ss.title(), url: reqURI, namespace: ss.namespace() }
			
			// Create a Template
			var dialog = new Ext.XTemplate(		
						// TODO find some nice words here -- copy from above ;)
						'<form class="oryx_repository_edit_model" action="#" id="edit_model" onsubmit="return false;">',
										
							'<fieldset>',
								'<p class="description">' + ORYX.I18N.Save.dialogDesciption + '</p>',
								'<input type="hidden" name="namespace" value="{namespace}" />',
								'<p><label for="edit_model_title">' + ORYX.I18N.Save.dialogLabelTitle + '</label><input type="text" class="text" name="title" value="{title}" id="edit_model_title" onfocus="this.className = \'text activated\'" onblur="this.className = \'text\'"/></p>',
								'<p><label for="edit_model_summary">' + ORYX.I18N.Save.dialogLabelDesc + '</label><textarea rows="5" name="summary" id="edit_model_summary" onfocus="this.className = \'activated\'" onblur="this.className = \'\'">{summary}</textarea></p>',
								'<p><label for="edit_model_type">' + ORYX.I18N.Save.dialogLabelType + '</label><input type="text" name="type" class="text disabled" value="{type}" disabled="disabled" id="edit_model_type" /></p>',
								
							'</fieldset>',
						
						'</form>')
			
			// Create the callback for the template
			callback = function(form){
						
				var title 		= form.elements["title"].value.strip();
				title 			= title.length == 0 ? defaultData.title : title;
				
				//added changing title of page after first save
				window.document.title = title + " - Oryx";
				
				var summary = form.elements["summary"].value.strip();	
				summary 	= summary.length == 0 ? defaultData.summary : summary;
				
				var namespace	= form.elements["namespace"].value.strip();
				namespace		= namespace.length == 0 ? defaultData.namespace : namespace;
				
				win.destroy();
				
				// Send the request out
				this.sendSaveRequest( reqURI, { data: this.serializedDOM, svg: svgDOM, title: title, summary: summary, type: namespace }, forceNew);
				
			}.bind(this);
			
			// Create a new window				
			win = new Ext.Window({
				id:		'Propertie_Window',
		        width:	'auto',
		        height:	'auto',
		        title:	forceNew ? ORYX.I18N.Save.saveAsTitle : ORYX.I18N.Save.save,
		        modal:	true,
				bodyStyle: 'background:#FFFFFF',
		        html: 	dialog.apply( defaultData ),
				buttons:[{
					text: ORYX.I18N.Save.saveBtn,
					handler: function(){
						callback( $('edit_model') )					
					}
				},{
                	text: ORYX.I18N.Save.close,
                	handler: function(){
		               this.facade.raiseEvent({
		                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE
		                });						
                    	win.destroy();
                	}.bind(this)
				}]
		    });
					      
			win.show();
			
		} else {
			
			// Send the request out
			this.sendSaveRequest( reqURI, { data: this.serializedDOM, svg: svgDOM } );
			
		}
    },
	
	sendSaveRequest: function(url, params, forceNew){

		// Send the request to the server.
		new Ajax.Request(url, {
                method: 'POST',
                asynchronous: false,
                parameters: params,
			onSuccess: (function(transport) {
				var loc = transport.getResponseHeader("location");
				if (loc) {
					this.processURI = loc;
				}
				else {
					this.processURI = url;
				}
				
				var modelUri="/model"+this.processURI.split("model")[1].replace(/self\/?$/i,"");
				location.hash="#"+modelUri;
				
				if( forceNew ){
					var newURLWin = new Ext.Window({
						title:		ORYX.I18N.Save.savedAs, 
						bodyStyle:	"background:white;padding:10px", 
						width:		'auto', 
						height:		'auto',
						html:"<div style='font-weight:bold;margin-bottom:10px'>"+ORYX.I18N.Save.saveAsHint+"</div><span><a href='" + loc +"' target='_blank'>" + loc + "</a></span>",
						buttons:[{text:'Ok',handler:function(){newURLWin.destroy()}}]
					});
					newURLWin.show();
				}

				//show saved status
				this.facade.raiseEvent({
						type:ORYX.CONFIG.EVENT_LOADING_STATUS,
						text:ORYX.I18N.Save.saved
					});
			}).bind(this),
			onFailure: (function(transport) {
				// raise loading disable event.
                this.facade.raiseEvent({
                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE
                });


				Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.Save.failed);
				
				ORYX.log.warn("Saving failed: " + transport.responseText);
			}).bind(this),
			on403: (function(transport) {
				// raise loading disable event.
                this.facade.raiseEvent({
                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE
                });


				Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.Save.noRights);
				
				ORYX.log.warn("Saving failed: " + transport.responseText);
			}).bind(this)
		});
				
	},
    
    /**
     * Saves the current process to the server.
     */
    save: function(forceNew, event){
    
        // raise loading enable event
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_LOADING_ENABLE,
			text: ORYX.I18N.Save.saving
        });
        
        // asynchronously ...
        window.setTimeout((function(){
        
            // ... save synchronously
            this.saveSynchronously(forceNew);
            
        }).bind(this), 10);

        
        return true;
    }	
});
	
	
	
ORYX.Plugins.File = Clazz.extend({

    facade: undefined,
	    
    construct: function(facade){
        this.facade = facade;
        
        this.facade.offer({
            'name': ORYX.I18N.File.print,
            'functionality': this.print.bind(this),
            'group': ORYX.I18N.File.group,
            'icon': ORYX.PATH + "images/printer.png",
            'description': ORYX.I18N.File.printDesc,
            'index': 3,
            'minShape': 0,
            'maxShape': 0
        });
        
        this.facade.offer({
            'name': ORYX.I18N.File.pdf,
            'functionality': this.exportPDF.bind(this),
            'group': ORYX.I18N.File.group,
            'icon': ORYX.PATH + "images/page_white_acrobat.png",
            'description': ORYX.I18N.File.pdfDesc,
            'index': 4,
            'minShape': 0,
            'maxShape': 0
        });
        
        this.facade.offer({
            'name': ORYX.I18N.File.info,
            'functionality': this.info.bind(this),
            'group': ORYX.I18N.File.group,
            'icon': ORYX.PATH + "images/information.png",
            'description': ORYX.I18N.File.infoDesc,
            'index': 5,
            'minShape': 0,
            'maxShape': 0
        });

    },
    

    
    info: function(){
    
        var info = '<iframe src="' + ORYX.CONFIG.LICENSE_URL + '" type="text/plain" ' + 
				   'style="border:none;display:block;width:575px;height:460px;"/>' +
				   '\n\n<pre style="display:inline;">Version: </pre>' + 
				   '<iframe src="' + ORYX.CONFIG.VERSION_URL + '" type="text/plain" ' + 
				   'style="border:none;overflow:hidden;display:inline;width:40px;height:20px;"/>';

		this.infoBox = Ext.Msg.show({
		   title: ORYX.I18N.Oryx.title,
		   msg: info,
		   width: 640,
		   maxWidth: 640,
		   maxHeight: 480,
		   buttons: Ext.MessageBox.OK
		});
        
        return false;
    },
    
    exportPDF: function(){
    	
		this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE, text:ORYX.I18N.File.genPDF});
		
        var resource = location.href;
        
        // Get the serialized svg image source
        var svgClone = this.facade.getCanvas().getSVGRepresentation(true);
        
        var svgDOM = DataManager.serialize(svgClone);
		
        // Send the svg to the server.
        //TODO make this better by using content negotiation instead of format parameter.
        //TODO make this better by generating svg on the server, too.
        new Ajax.Request(ORYX.CONFIG.PDF_EXPORT_URL, {
            method: 'POST',
            parameters: {
                resource: resource,
                data: svgDOM,
                format: "pdf"
            },
            onSuccess: (function(request){
            	this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
				
                // Because the pdf may be opened in the same window as the
                // process, yet the process may not have been saved, we're
                // opening every other representation in a new window.
                // location.href = request.responseText
                window.open(request.responseText);
            }).bind(this),
			onFailure: (function(){
				this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
				
				Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.File.genPDFFailed);
			}).bind(this)
        });
    },
    
    print: function(){
		
		Ext.Msg.show({
		   title		: ORYX.I18N.File.printTitle,
		   msg			: ORYX.I18N.File.printMsg,
		   buttons		: Ext.Msg.YESNO,
		   icon			: Ext.MessageBox.QUESTION,
		   fn			:  function(btn) {
	        
								if (btn == "yes") {
								
									// Set all options for the new window
									var option = $H({
										width: 300,
										height: 400,
										toolbar: "no",
										status: "no",
										menubar: "yes",
										dependent: "yes",
										resizable: "yes",
										scrollbars: "yes"
									});
									
									// Create the new window with all the settings
									var newWindow = window.open("", "PrintWindow", option.invoke('join', '=').join(','));
									
									// Add a style tag to the head and hide all controls
									var head = newWindow.document.getElementsByTagName('head')[0];
									var style = document.createElement("style");
									style.innerHTML = " body {padding:0px; margin:0px} .svgcontainer { display:none; }";
									head.appendChild(style);
									
									// Clone the svg-node and append this to the new body
									newWindow.document.getElementsByTagName('body')[0].appendChild(this.facade.getCanvas().getSVGRepresentation());
									var svg = newWindow.document.getElementsByTagName('body')[0].getElementsByTagName('svg')[0];
									
									// Set the width and height
									svg.setAttributeNS(null, 'width', 1100);
									svg.setAttributeNS(null, 'height', 1400);
									
									// Set the correct size and rotation
									svg.lastChild.setAttributeNS(null, 'transform', 'scale(0.47, 0.47) rotate(270, 1510, 1470)');
									
									var markers = ['marker-start', 'marker-mid', 'marker-end']
									var path = $A(newWindow.document.getElementsByTagName('path'));
									path.each(function(pathNode){
										markers.each(function(marker){
											// Get the marker value
											var url = pathNode.getAttributeNS(null, marker);
											if (!url) {
												return
											};
											
											// Replace the URL and set them new
											url = "url(about:blank#" + url.slice(5);
											pathNode.setAttributeNS(null, marker, url);
										});
									});
									
									// Get the print dialog
									newWindow.print();
									
									return true;
								}
							}.bind(this)
			});
    }   
});

/**
 * Method to load model or create new one
 * (moved from editor handler)
 */
window.onOryxResourcesLoaded = function() {
	
	if (location.hash.slice(1).length == 0 || location.hash.slice(1).indexOf('new')!=-1) {
		var stencilset = ORYX.Utils.getParamFromUrl('stencilset') || ORYX.CONFIG.SSET; // || "stencilsets/bpmn2.0/bpmn2.0.json";
		
		new ORYX.Editor({
			id: 'oryx-canvas123',
			stencilset: {
				url: "/oryx/" + stencilset
			}
		});
	} else {
		ORYX.Editor.createByUrl(
			"/backend/poem/" + location.hash.slice(1)+'/json', 
			{
				id: 'oryx-canvas123'
			}
		);
  	}
};
