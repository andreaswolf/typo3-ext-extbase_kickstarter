/**
 * Copyright (c) 2007 Kerstin Pfitzner
 * Copyright (c) 2009 Oliver Kopp
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
ORYX.Plugins.Bpel4ChorTransformation = ORYX.Plugins.AbstractPlugin.extend({

	dialogSupport: undefined,
	
	/**
	 * Offers the plugin functionality:
	 * 	- generation of XPDL4Chor
	 * 	- generation of BPEL4Chor
	 * 
	 * Registers for a ORYX.CONFIG.EVENT_PROPERTY_CHANGED event to react to changed
	 * element properties.
	 */
	construct: function() {
        // Call super class constructor
        arguments.callee.$.construct.apply(this, arguments);
		
		this.dialogSupport = new ORYX.Plugins.TransformationDownloadDialog();
		
        this.raisedEventIds = [];

		this.facade.offer({
			'name':ORYX.I18N.Bpel4ChorTransformation.exportBPEL,
			'functionality': this.transformBPEL4Chor.bind(this),
			'group': ORYX.I18N.Bpel4ChorTransformation.group,
			dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'icon': ORYX.PATH + "images/export_multi.png",
			'description': ORYX.I18N.Bpel4ChorTransformation.exportBPELDesc,
			'index': 1,
			'minShape': 0,
			'maxShape': 0});
			
		this.facade.offer({
			'name':ORYX.I18N.Bpel4ChorTransformation.exportXPDL,
			'functionality': this.transformXPDL4Chor.bind(this),
			'group': ORYX.I18N.Bpel4ChorTransformation.group,
            dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'icon': ORYX.PATH + "images/export.png",
			'description': ORYX.I18N.Bpel4ChorTransformation.exportXPDLDesc,
			'index': 0,
			'minShape': 0,
			'maxShape': 0});
			
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED, this.propertyChanged.bind(this));
	},
	
	// check if changed property does affect the transformability
	/**
	 * Reacts to a changed property in the property window, since this may cause
	 * errors during the transformation.
	 * 
	 * If the name of a receiving activity was changed:
	 *  - Determine all other receiving activities with an incoming message 
	 *    flow to the same source activity 
	 *  - If these receiving activities do not have the same name, print out
	 *    a warning in a message dialog.
	 *    
	 * If the loop type of a receive task was changed:
	 * 	- Check if the receive task is located directly after an event-based
	 *    decision gateway
	 *  - If so, print out a warning in a message dialog, because a looping 
	 *    task is not allowed after an event-based decision gateway in BPMNplus
	 * 
	 * @param {Object} args 
	 * 	- args.element: the changed shape
	 *  - args.name:    the name of the changed property
	 */
	propertyChanged: function(args) {	
		var shapes = args.elements;
		
		shapes.each(function(shape){
			var stencil = shape.getStencil();
			if (args.propId == "oryx-name") {
				if ((stencil.id() == stencil.namespace() + "ReceiveTask") || 
				 (stencil.id() == stencil.namespace() + "IntermediateMessageEvent") || 
				 (stencil.id() == stencil.namespace() + "StartMessageEvent")) {
					
					// get all receiving activities with same source
					var receiving = new Hash();
					shape.getIncomingShapes().each(function(edge) { 
						if (edge.getStencil().id() == edge.getStencil().namespace() + "MessageFlow") {
							var sources = edge.getIncomingShapes();
							sources.each(function(source) {
								// get target of all outgoing message flows
								source.getOutgoingShapes().each(function(edgeSource) {
									if (edgeSource.getStencil().id() == edgeSource.getStencil().namespace() + "MessageFlow") {
										var list = receiving[source.resourceId];
										if (list == undefined) {
											list = new Array();
										}
										list = list.concat(edgeSource.getOutgoingShapes());
										receiving[source.resourceId] = list;
									}
								});
							});
						}
					});
					
					var name = null
					var values = receiving.values();
					for (var i = 0; i < values.length; i++) {
						var list = values[i];
						for (var j = 0; j < list.length; j++) {
							var shape = list[j];
							if (name == undefined) {
								name = list[j].properties["oryx-name"];
							} else if (name != list[j].properties["oryx-name"]) {
								this.dialogSupport.openMessageDialog(ORYX.I18N.Bpel4ChorTransformation.warning,
									ORYX.I18N.Bpel4ChorTransformation.wrongValue.replace(/1/, name));
								return;
							}
						}
					}
				}
			} else if (args.propId == "oryx-looptype") {
			
				// if parent of receive task is event-based decision gateway
				// the loop type should be None to be transformable to BPEL4Chor
				if (stencil.id() == stencil.namespace() + "ReceiveTask") {
					// get incoming sequence flows
					shape.getIncomingShapes().each(function(edge) { 
						if (edge.getStencil().id() == edge.getStencil().namespace() + "SequenceFlow") {
							// get source of sequence flows
							var sources = edge.getIncomingShapes();
							sources.each(function(source) {
								if (source.getStencil().id() == stencil.namespace() + "Exclusive_Eventbased_Gateway") {
									if (shape.properties["oryx-looptype"] != "None") {
										this.dialogSupport.openMessageDialog(ORYX.I18N.Bpel4ChorTransformation.warning, ORYX.I18N.Bpel4ChorTransformation.loopNone);
										 return;
									}
								}
							});
						}
					});
				}
			}
		});
		
	},
	
	/**
	 * Checks if all edges have a source and a target element. 
	 * If not print out an error in a message dialog.
	 * 
	 * The check is necessary because such edges would lead to a parser
	 * error during the transformation.
	 */
	validate: function() {
		// check if all edges have a source and a target
		var edges = this.facade.getCanvas().getChildEdges();
		var valid = true;
		for (var i = 0; i < edges.size(); i++) {
			var edge = edges[i];
			var name = edge.getStencil().title();
			var id = edge.id;
			// TODO: highlight shapes
			if (edge.getIncomingShapes().size() == 0) {
				//this.dialogSupport.openMessageDialog(ORYX.I18N.Bpel4ChorTransformation.error, ORYX.I18N.Bpel4ChorTransformation.noSource.replace(/1/, name).replace(/2/, id));
				this.showOverlay(edge, ORYX.I18N.Bpel4ChorTransformation.noSource.replace(/1/, name).replace(/2/, id));
				valid = false;
			} else if (edge.getOutgoingShapes().size() == 0) {
//				this.dialogSupport.openMessageDialog(
//					ORYX.I18N.Bpel4ChorTransformation.error, ORYX.I18N.Bpel4ChorTransformation.noTarget.replace(/1/, name).replace(/2/, id));
				this.showOverlay(edge, ORYX.I18N.Bpel4ChorTransformation.noTarget.replace(/1/, name).replace(/2/, id));
				valid = false;
			}	
		}
		return valid;
	},
	
	/**
	 * Since canvas properties are not serialized they can not be
	 * transformed using xslt. Thus, they will be added after the
	 * xslt transformation using this method.
	 * 
	 * @param {Object} xpdl4chor The generated xpdl4chor document
	 */
	addCanvasProperties: function(xpdl4chor) {
		// chor:TargetNamespace
		var canvas = this.facade.getCanvas();
		var targetNamespace = xpdl4chor.createAttribute("chor:TargetNamespace");
		targetNamespace.value = canvas.properties["oryx-targetNamespace"];
		xpdl4chor.documentElement.setAttributeNode(targetNamespace);
		
		// Name
		var name = xpdl4chor.createAttribute("Name");
		name.value = canvas.properties["oryx-name"];
		xpdl4chor.documentElement.setAttributeNode(name);
		
		// Id
		var idAttr = xpdl4chor.createAttribute("Id");
		var id = canvas.properties["oryx-id"];
		if (id == "") {
			id = DataManager.__provideId();
		}
		idAttr.value = id;
		xpdl4chor.documentElement.setAttributeNode(idAttr);
		
		// PackageHeader.Created
		var created = xpdl4chor.createElement("xpdl:Created");
		var createdText = document.createTextNode(canvas.properties["oryx-creationdate"]);
		created.appendChild(createdText);
		var parent = xpdl4chor.documentElement.firstChild;
		parent.appendChild(created);
		
		// RedefinableHeader
		var expressionLanguage = canvas.properties["oryx-expressionlanguage"];
		var queryLanguage = canvas.properties["oryx-querylanguage"];
		
		var header = xpdl4chor.createElement("xpdl:RedefinableHeader");
		if (queryLanguage != "") {
			var queryLangAttr = xpdl4chor.createAttribute("chor:QueryLanguage");
			queryLangAttr.value = queryLanguage;
			header.setAttributeNode(queryLangAttr);
		}
		if (expressionLanguage != "") {
			var expressionLangAttr = xpdl4chor.createAttribute("chor:ExpressionLanguage");
			expressionLangAttr.value = expressionLanguage;
			header.setAttributeNode(expressionLangAttr);
		}
		// append header after first child (PackageHeader node)
		xpdl4chor.documentElement.insertBefore(header, xpdl4chor.documentElement.firstChild.nextSibling);
	},
	
	
	/**
	 * Builds up the data that will be shown in the result dialog of
	 * the XPDL4Chor transformation.
	 * 
	 * @param {String} xpdl4chor The generated XPDL4Chor.
	 */
	buildXPDL4ChorData: function(xpdl4chor) {
		var data = [
		    ["XPDL4Chor", xpdl4chor, this.dialogSupport.getResultInfo(xpdl4chor)]
		];
		
		return data;
	},
	
	
	/**
	 * Builds up the data that will be shown in the result dialog of
	 * the BPEL4Chor transformation.
	 * For this purpose the process names are determined and
	 * it is checked if the topology and process were generated
	 * successfully.
	 * 
	 * @param res - the result of the servlet 
	 * @return {"data" : <data for the download dialog>, "errors": <data for syntax highlighting>}
	 */
	buildDisplayData: function(transformRes) {
		var res = {
			"data": [[]], // each element is a tuple (file, data, success)
			"errors": [[]]  // each element is a record (shape, message)
		}
		
		var curError = 0;
		
		for (var i = 0; i < transformRes.length; i++) {
			var file;
			if (transformRes[i].type == "PROCESS") {
				file = transformRes[i].name;
			} else {
				file = transformRes[i].type.toLowerCase();
			}
			
			var success;
			var transformResult;
			
			if (transformRes[i].success) {
				success = "success";
				transformResult = transformRes[i].document;
			} else {
				success = "error";
				transformResult = "";
				for (var j=0; j<transformRes[i].errors.length; j++) {
					var error = transformRes[i].errors[j];
					transformResult = transformResult + error.message;
					if (error.id) {
						transformResult = transformResult + " (" + error.id + ")";
					}
					transformResult = transformResult + "\n";
					res.errors[curError] = error;
					curError++;
				}
			}
			
			res.data[i] = [file, transformResult, success];
		}
		
		if (curError == 0) {
			// no errors were found
			// the array has to be defined, but empty
			res.errors = []; 
		}
		
		return res;
	},
	
	
	/**
	 * Analyzes the result of the servlet call.
	 * 
	 * If an fault occurred or the answer is undefined, the error is shown
	 * using a message dialog.
	 * 
	 * If the first result starts with "ParserError" the error is shown using an 
	 * error dialog. Otherwise the result is shown using the result dialog.
	 * 
	 * @param {Object} result - the result of the transformation servlet (JSON)
	 */
	displayResult: function(result) {
		this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});

		var resultString = '(' + result + ')';
		var resultObject;
		
		try {
			resultObject = eval(resultString);
		} catch (e1) {
			Ext.Msg.alert("Error during evaluation of result: " + e1 + "\r\n" + resultString);
		}
		
		var version = resultObject.version;
		if (version != "1.0")
			Ext.Msg.alert("Wrong version " + version + ". Converting nevertheless.");
		
		if ((!resultObject.res) || (resultObject.res.length == 0)) {
			this.dialogSupport.openMessageDialog(ORYX.I18N.TransformationDownloadDialog.error,ORYX.I18N.TransformationDownloadDialog.noResult);
	    } else {
			var displayData = this.buildDisplayData(resultObject.res);
            displayData.errors.each(function(error){
            	if (error.id == "undefined")
            		return;
            	
                sh = this.facade.getCanvas().getChildShapeByResourceId(error.id);
                if (!sh) {
                	// id was not found. It is possible that the element is a process with its own id
            		sh = this.facade.getCanvas().getChildShapes(true).find(function(shape) {
            			processId = shape.properties["oryx-processid"]; 
            			if (processId == "") {
            				return (shape.resourceId + "_process" == error.id);
            			} else {
            				return (processId == error.id);
            			}
    				});
                }                
                if (sh) {
                    this.showOverlay(sh, error.message);
                }
            }.bind(this));
			this.dialogSupport.openResultDialog(displayData.data);
		}
	},
	
	
	/**
	 * Transforms the model to XPDL4Chor using the xslt stylesheet.
	 * After that the web service for the transformation to BPEL4Chor
	 * will be called.
	 * 
	 * @param {Object} xpdlOnly True, if only the XPDL4Chor should be 
	 *                          generated, false otherwise
	 */
	transform: function(xpdlOnly) {		
		this.hideOverlays();
		
		var valid = this.validate();
	   	if (!valid) {
			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
			Ext.Msg.alert("Transformation","input not valid");
			// TODO: store the validation result and display it using this.displayResult(response.responseText);
			return null;
		}
		var xsl = "";
		source = ORYX.PATH + "xslt/BPMNplus2XPDL4Chor.xslt";
			new Ajax.Request(source, {
				asynchronous: false,
				method: 'get',
				onSuccess: function(transport){
					xsl = transport.responseText
				}.bind(this),
				onFailure: (function(transport){
					ORYX.Log.error("XSL load failed" + transport);
				}).bind(this)
			});
		var xsltProcessor = new XSLTProcessor();		
		
		var ERDF = this.facade.getERDF();
		var parser=new DOMParser();
		var xslObject = parser.parseFromString(xsl, "text/xml");
		xsltProcessor.importStylesheet(xslObject);
		var doc=parser.parseFromString(ERDF,"text/xml");
			
		try {
			var xpdl4chor = xsltProcessor.transformToDocument(doc, document);
		} catch (error) {
			this.dialogSupport.openMessageDialog(ORYX.I18N.Bpel4ChorTransformation.error, ORYX.I18N.Bpel4ChorTransformation.noGen.replace(/1/, error.name).replace(/2/, error.message));
			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
			return null;
		}
			
		this.addCanvasProperties(xpdl4chor);
			
		var serialized = (new XMLSerializer()).serializeToString(xpdl4chor);
		serialized = serialized.startsWith("<?xml") ? serialized : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serialized;

		if (xpdlOnly) {
			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
				
			var data = this.buildXPDL4ChorData(serialized);
			this.dialogSupport.openResultDialog(data);
		} else {
			var target = "http://" + location.host + ORYX.CONFIG.XPDL4CHOR2BPEL4CHOR_TRANSFORMATION_URL;
			try {
				Ext.Ajax.request({
					method : "POST",
					url : target,
					params : {data: serialized},
					success : function(response, options) {
						this.displayResult(response.responseText);
					}.bind(this)
				});
			} catch (e) {
				Ext.Msg.alert("Error during call of transformation: " + e);
			}
		}
	},
	
	/**
	 * Transform the model to its XPDL4Chor representation.
	 */
	transformXPDL4Chor: function() { 		
		this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE, text:ORYX.I18N.Bpel4ChorTransformation.loadingXPDL4ChorExport});
		this.transform(true);
	},

  	/**
  	 * Transform the model to its BPELChor representation.
  	 */
	transformBPEL4Chor: function(){ 	   
		this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE, text:ORYX.I18N.Bpel4ChorTransformation.loadingBPEL4ChorExport});
		this.transform(false);		
	},

	/**
	 * Copied from validator.js
	 */
    showOverlay: function(shape, errorMsg){
    
        var id = "syntaxchecker." + this.raisedEventIds.length;
        
        var cross = ORYX.Editor.graft("http://www.w3.org/2000/svg", null, ['path', {
            "title": errorMsg,
            "stroke-width": 5.0,
            "stroke": "red",
            "d": "M20,-5 L5,-20 M5,-5 L20,-20",
            "line-captions": "round"
        }]);
        
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_OVERLAY_SHOW,
            id: id,
            shapes: [shape],
            node: cross,
            nodePosition: shape instanceof ORYX.Core.Edge ? "START" : "NW"
        });
        
        this.raisedEventIds.push(id);
    },

	/**
	 * Copied from validator.js
	 */
    hideOverlays: function(){
        this.raisedEventIds.each(function(id){
            this.facade.raiseEvent({
                type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
                id: id
            });
        }
.bind(this));
        
        this.raisedEventIds = [];
    },
    
	
});


