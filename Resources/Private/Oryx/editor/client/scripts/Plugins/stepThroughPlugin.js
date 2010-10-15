/*
 * TODO interaction format step through <=> oryx should be json!!!
 */
/**
 * Copyright (c) 2008, Christoph Neijenhuis, modified by Kai Schlichting
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

/**
 * @namespace Oryx name space for plugins
 * @name ORYX.Plugins
 **/
Ext.namespace("ORYX.Plugins");

ORYX.Plugins.AbstractStepThroughPlugin = ORYX.Plugins.AbstractPlugin.extend({
    construct: function() {
        // Call super class constructor
        arguments.callee.$.construct.apply(this, arguments);
        
        this.facade.offer({
            'name': ORYX.I18N.StepThroughPlugin.stepThrough,
            'functionality': this.load.bind(this),
            'group': ORYX.I18N.StepThroughPlugin.group,
            'icon': ORYX.PATH + "images/control_play.png",
            'description': ORYX.I18N.StepThroughPlugin.stepThroughDesc,
            'index': 1,
            'toggle' : true,
            'minShape': 0,
            'maxShape': 0
        });
        
        this.facade.offer({
            'name': ORYX.I18N.StepThroughPlugin.undo,
            'functionality': this.undo.bind(this),
            'group': ORYX.I18N.StepThroughPlugin.group,
            'icon': ORYX.PATH + "images/control_rewind.png",
            'description': ORYX.I18N.StepThroughPlugin.undoDesc,
            'index': 2,
            'minShape': 0,
            'maxShape': 0
        });
    },
    showEnabled: function(shape, display){
        // Creates overlay for an enabled shape
        // display is beeing ignored
        if (!(shape instanceof ORYX.Core.Shape)) {
            return;
        }
        else if (this.isOrSplit(shape)) { //special handling for OR-Split
            this.showEnabledOrSplit(shape);
            return;
        }
        
        this.showPlayOnShape(shape);
    },
    
    showPlayOnShape: function(shape){
        var attr;
        if (shape instanceof ORYX.Core.Edge) {
            attr = {
                stroke: "green"
            };
        }
        else {
            attr = {
                fill: "green"
            };
        }
        
        var play = ORYX.Editor.graft("http://www.w3.org/2000/svg", null, ['path', {
            "title": "Click the element to execute it!",
            "stroke-width": 2.0,
            "stroke": "black",
            "d": "M0,-5 L5,0 L0,5 Z",
            "line-captions": "round"
        }]);
        
        this.showOverlayOnShape(shape, attr, play);
    },
    
    showOverlayOnShape: function(shape, attributes, node){
        this.hideOverlayOnShape(shape);
        
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_OVERLAY_SHOW,
            id: "st." + shape.resourceId,
            shapes: [shape],
            attributes: attributes,
            node: (node ? node : null),
            nodePosition: shape instanceof ORYX.Core.Edge ? "END" : "SE"
        });
    },
    
    hideOverlayOnShape: function(shape){
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
            id: "st." + shape.resourceId
        });
    },
    
    // Pass preserveInitialMarking = true as config option, if initial marking 
    // should not be deleted 
    hideOverlays: function(preserveInitialMarking){
        // hides all overlays
        var els = this.facade.getCanvas().getChildShapes(true);
        var el;
        for (i = 0; i < els.size(); i++) {
            el = els[i];
            // This may send hide-events for objects that have no overlay
            if (!(preserveInitialMarking && this.isStartNode(el))) {
                this.facade.raiseEvent({
                    type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
                    id: "st." + el.resourceId
                });
            }
        }
    },
    
    /**
     * Called when the user loads or unloads the plugin
     * @methodOf ORYX.Plugins.StepThroughPlugin
     */
    load: function(button, pressed){
        this.initializeLoadButton(button, pressed);
      
        if (!pressed) {
            // Reset vars
            this.executionTrace = "";
            this.rdf = undefined;
            
            // Reset syntax checker errors
            this.facade.raiseEvent({type: ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT});
            
            this.onDeactivate();
        } else {
            this.initialMarking = [];
            
            if (this.getDiagramType() === "epc") {
                this.prepareInitialMarking();
            }
            else { //only start immediately for bpmn diagrams and Petri nets
                this.startAndCheckSyntax();
            }
        }
        
        if (this.active()) {
            this.callback = this.doMouseUp.bind(this)
            this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP, this.callback)
        } else {
            this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_MOUSEUP, this.callback)
            this.callback = undefined;
        }
    },
    
    // When plugin is deactivated through pressing the button
    // Overwrite to implement custom behavior
    onDeactivate: function(){
        // Hide overlays
        this.hideOverlays();
    },
    
    // Very evil, this method is a result from Oryx generalized plugin infrastructure
    // Direct access to button needed, so that this can be done in construct method
    initializeLoadButton: function(button, pressed){
        if(this.loadButton !== button){
            // Sets state of the loadButton and sets the model readonly
            var toggleActive = function(active){
                if(active){
                    //Set "readonly" (edges cannot be moved anymore)
                    this.facade.disableEvent(ORYX.CONFIG.EVENT_MOUSEDOWN);
                } else {
                    this.facade.enableEvent(ORYX.CONFIG.EVENT_MOUSEDOWN);
                }
            }.createDelegate(this);
            
            button.on('toggle', function(button, p){
                toggleActive(p);
            });
            // Very evil!! The first time, toggle event isn't thrown 
            // Should be like that listeners can be defined earlier!!!
            toggleActive(button, pressed);
        }
        this.loadButton = button;
    },
    
    active: function(){
        return this.loadButton ? this.loadButton.pressed : false;
    },
    
    onSelectionChanged: function(){
        if (this.active() && this.facade.getSelection().length > 0) {
            // Stop the user from editing the diagram while the plugin is active
            this.facade.setSelection([]);
        }
    },
    
    //TODO generic function
    getDiagramType: function(){
        switch (this.facade.getCanvas().getStencil().namespace()) {
            case "http://b3mn.org/stencilset/epc#":
                return "epc";
            case "http://b3mn.org/stencilset/bpmn#":
                return "bpmn";
            default:
                return null;
        }
    },
    
    showUsed: function(shape, display){
        // Creates overlay for a shape that has been used and is not enabled
        if (!(shape instanceof ORYX.Core.Shape)) 
            return;
        
        var attr;
        if (shape instanceof ORYX.Core.Edge) {
            attr = {
                stroke: "mediumslateblue"
            };
        }
        else {
            attr = {
                fill: "mediumslateblue"
            };
        }
        
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
            id: "st." + shape.resourceId
        });
        
        if (display != "-1" && display != "1") {
            // Show the number
            var text = ORYX.Editor.graft("http://www.w3.org/2000/svg", null, ['text', {
                "style": "font-size: 16px; font-weight: bold;"
            }, display]);
            
            this.facade.raiseEvent({
                type: ORYX.CONFIG.EVENT_OVERLAY_SHOW,
                id: "st." + shape.resourceId,
                shapes: [shape],
                attributes: attr,
                node: text,
                nodePosition: shape instanceof ORYX.Core.Edge ? "END" : "SE"
            });
        }
        else {
            // This is an XOR split, don't display number
            this.facade.raiseEvent({
                type: ORYX.CONFIG.EVENT_OVERLAY_SHOW,
                id: "st." + shape.resourceId,
                shapes: [shape],
                attributes: attr
            });
        }
    }
});

ORYX.Plugins.PetriNetStepThroughPlugin = ORYX.Plugins.AbstractStepThroughPlugin.extend({
    construct: function() {
        // Call super class constructor
        arguments.callee.$.construct.apply(this, arguments);
    },
    startAndCheckSyntax: function(){
        this.facade.raiseEvent({
            type: ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT,
            onErrors: function(){
                Ext.Msg.alert("Syntax Check", "Some syntax errors have been found, please correct them!");
            }.bind(this),
            onNoErrors: function(){
                this.initializeMarking();
                
                this.firedTransitions = [];
            
                this.showEnabledTransition();
            }.bind(this)
        });
    },

    /**
     * Initializes the number of tokens for each place. Additionally, if none of the places have a token, the initial places
     * get one.
     */
    initializeMarking: function(){
        var anyTokenFound = false;
        
        this.getPlaces().each(function(place){
            var tokens = parseInt(place.properties["oryx-numberoftokens"]);
            if(isNaN(tokens)){
                // All places which don't have any number of tokens, gets 0 tokens explicitly
                place.setProperty("oryx-numberoftokens", 0);
            } else if(tokens > 0){
                anyTokenFound = true;
            }
        });
        
        // If no place has any token, all incoming places gets tokens
        if(!anyTokenFound){
            this.getPlaces().each(function(place){
                if(place.getIncomingShapes().length == 0){
                    place.setProperty("oryx-numberoftokens", 1);
                }
            });
            Ext.Msg.show({
               title:'No Tokens Found',
               msg: 'Current marking of the Petri net doesn\'t contain any token. Tokens are added to the initial places of the net.',
               buttons: Ext.Msg.OK,
               icon: Ext.MessageBox.INFO
            });
        }
    },
    
    doMouseUp: function(event, shape){
        if (!(this.isTransition(shape))) return; // Can be a docker, place or something else
    
        this.fireTransition(shape);
        this.showEnabledTransition();
    },
    
    onDeactivate: function(){
        // Hide overlays
        this.hideOverlays();
        
        // Undo all fired transitions so that the marking is the initial marking
        while(this.firedTransitions.length !== 0){
            this.undoLastFiredTransition();
        }
        this.facade.getCanvas().update(); //update markings
        
        this.facade.raiseEvent({type: ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT});
    },
    
    fireTransition: function(transition){
        this.firedTransitions.push(transition);
        this.getIncomingNodes(transition).each(function(place){
            this.removeToken(place);
        }.bind(this));
        this.getOutgoingNodes(transition).each(function(place){
            this.addToken(place);
        }.bind(this));
    },
    
    undoLastFiredTransition: function(){
        var transition = this.firedTransitions.pop();
        
        // If there is no transition anymore, just quit
        if(!transition) return;
        
        this.getIncomingNodes(transition).each(function(place){
            this.addToken(place);
        }.bind(this));
        this.getOutgoingNodes(transition).each(function(place){
            this.removeToken(place);
        }.bind(this));
    },
    
    removeToken: function(place){
        place.setProperty("oryx-numberoftokens", parseInt(place.properties["oryx-numberoftokens"])-1);
    },
    
    addToken: function(place){
        var tokens = parseInt(place.properties["oryx-numberoftokens"]) +1;
    
        place.setProperty("oryx-numberoftokens", tokens);
        
        if(tokens > 3){
            Ext.Msg.show({
               title:'Too Many Tokens On Place',
               msg: 'Places with more than 3 tokens aren\'t supported yet. Please try to avoid this scenario.',
               buttons: Ext.Msg.OK,
               icon: Ext.MessageBox.WARNING
            });
        }
    },
    
    showEnabledTransition: function(){
        this.hideOverlays();
        
        this.firedTransitions.each(function(transition){
            this.showUsed(transition, "1");
        }.bind(this));
        
        this.getEnabledTransitions().each(function(transition){
            this.showPlayOnShape(transition);
        }.bind(this));
        
        this.facade.getCanvas().update();
    },
    getTransitions: function(){
        return this.facade.getCanvas().getChildShapes().select(function(shape){
            return this.isTransition(shape);
        }.bind(this));
    },
    isTransition: function(shape){
        return shape instanceof ORYX.Core.Shape && shape.getStencil().id().search(/Transition/) > -1;
    },
    getPlaces: function(){
        return this.facade.getCanvas().getChildShapes().select(function(shape){
            return shape.getStencil().id().search(/Place/) > -1;
        });
    },
    getIncomingNodes: function(node){
      return node.getIncomingShapes().collect(function(arc){
        return arc.getIncomingShapes();
      }).flatten();
    },
    getOutgoingNodes: function(node){
      return node.getOutgoingShapes().collect(function(arc){
        return arc.getOutgoingShapes();
      }).flatten();
    },
    getEnabledTransitions:function(){
        return this.getTransitions().select(function(transition){
            // Checks whether all incoming places have at least 1 token
            return this.getIncomingNodes(transition).all(function(place){
                return parseInt(place.properties["oryx-numberoftokens"]) > 0;
            });
        }.bind(this));
    },
    undo: function(){
        this.undoLastFiredTransition();
        this.showEnabledTransition();
    }
});

/**
 * Step Through Plugin
 * @class ORYX.Plugins.StepThroughPlugin
 * @constructor Creates new plugin instance
 */
ORYX.Plugins.StepThroughPlugin = ORYX.Plugins.AbstractStepThroughPlugin.extend({

    /**
     * My method!
     * @methodOf ORYX.Plugins.StepThroughPlugin
     */
    construct: function(facade){
        this.el = undefined;
        this.callback = undefined;
        this.executionTrace = ""; // A string containing all objects that have been fired
        this.rdf = undefined;
                
        arguments.callee.$.construct.apply(this, arguments);
    },
    
    // Each start node and each start arc gets colored
    prepareInitialMarking: function(){
        this.startNodes = [];
        
        Ext.each(this.facade.getCanvas().getChildShapes(true), function(shape){
            if (this.isStartNode(shape)) {
                this.startNodes.push(shape);
                shape.initialMarkingFired = false;
                this.showPlayOnShape(shape);
                if (shape.getOutgoingShapes().size() == 1) {
                    this.showOverlayOnShape(shape.getOutgoingShapes()[0], {
                        stroke: "green"
                    });
                    shape.getOutgoingShapes()[0].initialMarking = true;
                }
            }
        }
.createDelegate(this));
    },
    
    /* Returns true if node is start node */
    isStartNode: function(shape){
        return (shape.getStencil().id().search(/#Event$/) > -1) && shape.getIncomingShapes().length == 0 && shape.getOutgoingShapes().length == 1;
    },
    
    /* Returns true if source node from arc is start node */
    isStartArc: function(shape){
        return this.isStartNode(shape.getIncomingShapes()[0]);
    },
    
    isStartArcOrNode: function(shape){
        return this.isStartNode(shape) || this.isStartArc(shape);
    },
    
    /* TODO this should be a general oryx helper method!! */
    generateRDF: function(){
        
        try {
            var serialized_rdf = this.getRDFFromDOM();
            
            // Firefox 2 to 3 problem?!
            serialized_rdf = !serialized_rdf.startsWith("<?xml") ? "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serialized_rdf : serialized_rdf;
        } 
        catch (error) {
            this.facade.raiseEvent({
                type: ORYX.CONFIG.EVENT_LOADING_DISABLE
            });
            Ext.Msg.alert(ORYX.I18N.Oryx.title, error);
        }
        
        this.rdf = serialized_rdf;
    },
    
    getRDF: function(){
        if (this.rdf == undefined) {
            this.generateRDF();
        }
        
        return this.rdf;
    },
    
    startAndCheckSyntax: function(){
        this.postExecutionTrace({
            checkSyntax: true,
            onlyChangedObjects: false,
            onSuccess: function(request){
                //TODO use always json!!!! This is a bad hack!!!
                if (request.responseText.startsWith("{")){ //seems to be json
                    var errors = Ext.decode(request.responseText).syntaxErrors;
                    
                    // Show errors
                    this.facade.raiseEvent({
                        type: ORYX.Plugins.SyntaxChecker.SHOW_ERRORS_EVENT,
                        errors: errors
                    });
                } else { //normal step through response
                    this.showObjectStates(request.responseText);
                }
            }.bind(this)
        });
    },
    
    fireObject: function(objResourceId){
        // Add this object to executionTrace
        this.executionTrace += objResourceId + ";";
        
        // Add selected edges for or split
        if (this.isOrSplit(this.el)) {
            //eliminate ;
            this.executionTrace = this.executionTrace.substring(0, this.executionTrace.length - 1);
            this.executionTrace += "#";
            var outgoingEdges = new Ext.util.MixedCollection();
            outgoingEdges.addAll(this.el.getOutgoingShapes());
            var firingEdgesResourceIds = [];
            outgoingEdges.filter("selectedForOrSplit", "true").each(function(edge){
                firingEdgesResourceIds.push(edge.resourceId);
            }
.createDelegate(this));
            outgoingEdges.each(function(edge){
                edge.selectedForOrSplit = false;
                this.hideOverlayOnShape(edge);
            }
.createDelegate(this));
            this.executionTrace += firingEdgesResourceIds.join(",") + ";";
        }
        
        this.postExecutionTrace({
            checkSyntax: false,
            onlyChangedObjects: true,
            onSuccess: function(request){
                if (request.responseText != "") {
                    // successful
                    this.showObjectStates(request.responseText);
                }
                else {
                    // object couldn't be fired, remove it from executionTrace
                    this.removeLastFiredObject();
                }
            }
.bind(this)
        });
    },
    
    doMouseUp: function(event, arg){
        if (arg instanceof ORYX.Core.Shape) {
            // if its an or split
            if (arg instanceof ORYX.Core.Edge && this.isOrSplit(arg.getIncomingShapes()[0])) {
                this.doMouseUpOnEdgeComingFromOrSplit(arg);
                // else if its an epc start node
            }
            else if (arg instanceof ORYX.Core.Edge && this.getDiagramType() === "epc" && this.isStartNode(arg.getIncomingShapes()[0])) {
                this.doMouseUpOnEdgeComingFromStartNode(arg);
            }
            else if (this.getDiagramType() === "epc" && this.isStartNode(arg)) {
                arg.initialMarkingFired = true;
                var edge = arg.getOutgoingShapes()[0];
                this.hideOverlayOnShape(edge);
                if (edge.initialMarking) {
                    this.showUsed(arg, "1");
                    this.initialMarking.push(arg.resourceId);
                }
                else {
                    this.hideOverlayOnShape(arg);
                }
                
                // If clicked node is the last startNode, activate real step through
                var allStartNodesFired = true;
                Ext.each(this.startNodes, function(startNode){
                    if (!startNode.initialMarkingFired) {
                        allStartNodesFired = false;
                    }
                });
                
                if (allStartNodesFired) {
                    this.startAndCheckSyntax();
                }
            }
            else {
                this.el = arg;
                this.fireObject(this.el.resourceId);
            }
        }
    },
    
    showObjectStates: function(objs){
        var objsAndState = objs.split(";");
        for (i = 0; i < objsAndState.size(); i++) {
            var objAndState = objsAndState[i].split(",");
            if (objAndState.size() < 3) {
                continue;
            }
            var obj = this.facade.getCanvas().getChildShapeByResourceId(objAndState[0]);
            if (objAndState[2] == "t") { // Is enabled
                this.showEnabled(obj, objAndState[1]);
            }
            else if (objAndState[1] != "0") { // has been used
                this.showUsed(obj, objAndState[1]);
            }
            else { // Was enabled, has not been used
                this.hideOverlayOnShape(obj);
            }
        }
    },
    
    doMouseUpOnEdgeComingFromOrSplit: function(edge){
        var orSplit = edge.getIncomingShapes()[0];
        
        if (edge.selectedForOrSplit) { //deselect edge
            this.showOverlayOnShape(edge, {
                stroke: "orange"
            });
            
            // Hide or-split overlay, if last edge has been deselected
            var outgoingEdges = new Ext.util.MixedCollection();
            outgoingEdges.addAll(orSplit.getOutgoingShapes());
            if (outgoingEdges.filter("selectedForOrSplit", "true").length <= 1) { // > 1, because current edge is in this list
                this.hideOverlayOnShape(orSplit);
            }
            
        }
        else { //select edge
            this.showOverlayOnShape(edge, {
                stroke: "green"
            });
            this.showPlayOnShape(orSplit);
        }
        
        // toggle selection
        edge.selectedForOrSplit = !edge.selectedForOrSplit;
    },
    
    // Toggles color and initialMarking value of start arcs
    doMouseUpOnEdgeComingFromStartNode: function(edge){
        edge.initialMarking = !edge.initialMarking;
        
        if (edge.initialMarking) {
            this.showOverlayOnShape(edge, {
                stroke: "green"
            });
        }
        else {
            this.showOverlayOnShape(edge, {
                stroke: "orange"
            });
        }
    },
    
    //checks whether shape is OR gateway and hasn't more than 1 outgoing edges
    isOrSplit: function(shape){
        return (shape.getStencil().id().search(/#(OR_Gateway|OrConnector)$/) > -1) && (shape.getOutgoingShapes().length > 1);
    },
    
    showEnabledOrSplit: function(shape){
        Ext.each(shape.getOutgoingShapes(), function(edge){
            Ext.apply(edge, {
                selectedForOrSplit: false
            });
            
            this.showOverlayOnShape(edge, {
                stroke: "orange"
            });
        }
.createDelegate(this));
    },
   
    removeLastFiredObject: function(){
        // Removes last entry in execution trace
        this.executionTrace = this.executionTrace.replace(/[^;]*;$/, "")
    },
    
    undo: function(){
        if (!this.active()) 
            return;
        
        if (this.executionTrace !== "") {
            this.removeLastFiredObject();
            
            this.postExecutionTrace({
                checkSyntax: false,
                onlyChangedObjects: false,
                onSuccess: function(request){
                    // Hide overlays because everything is drawn from scratch
                    this.hideOverlays(true);
                    // Draw new overlays
                    this.showObjectStates(request.responseText);
                }
.bind(this)
            });
        }
        else if (this.getDiagramType() === "epc") {
            this.hideOverlays();
            this.prepareInitialMarking(); // "reset" initial marking
        }
    },
    
    /* Posts current execution trace to server for executing 
     * options is a hash with following keys:
     * - onlyChangedObjects (boolean)
     * - onSuccess (function with parameter request)
     * - checkSyntax (boolean)
     */
    postExecutionTrace: function(options){
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_LOADING_ENABLE,
            text: ORYX.I18N.StepThroughPlugin.executing
        });
        
        //TODO merge in default options
        new Ajax.Request(ORYX.CONFIG.STEP_THROUGH, {
            method: 'POST',
            asynchronous: false,
            parameters: {
                rdf: this.getRDF(),
                checkSyntax: options.checkSyntax,
                fire: this.executionTrace,
                onlyChangedObjects: options.onlyChangedObjects,
                initialMarking: this.initialMarking.join(";")
            },
            onSuccess: function(response){
                this.facade.raiseEvent({
                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE
                });
                options.onSuccess(response);
            }.createDelegate(this),
            onFailure: function(){
                //TODO raise error message?
                this.facade.raiseEvent({
                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE
                });
            }.createDelegate(this)
        });
    }
});
