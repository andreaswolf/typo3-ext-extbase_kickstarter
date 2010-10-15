/**
 * Copyright (c) 2008
 * Philipp Maschke
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

ORYX.Plugins.AutoLayout = ORYX.Plugins.AbstractPlugin.extend({

	facade: undefined,

	construct: function(facade) {
		this.facade = facade;
		this.returned_layout = [];

		this.facade.offer({
			'name':"AutoLayout",
			'functionality': this.automatic_layout.bind(this),
			'group': "Alignment",
			'icon': ORYX.PATH + "images/auto_layout.png",
			'description': "automatic layouting",
			'index': 0,
			'minShape': 0,
			'maxShape': 0});


		facade.registerOnEvent(ORYX.CONFIG.EVENT_AUTOLAYOUT_LAYOUT, this.force_automatic_layout.bind(this));
		
	},

	adjust_node: function(node){
		//adjusts node bounds if node has new layout info
		//starts adjustment for all child nodes after adjusting self
		var	r_id = node.resourceId;
		if (this.returned_layout[r_id]){
			var n_b = this.returned_layout[r_id];
			node.bounds.set({x: n_b.x, y: n_b.y}, {x: (n_b.width + n_b.x), y: (n_b.height + n_b.y)});
		}
		a_b = node.bounds;
		var nodes = node.getChildNodes();
		for (var i = 0; i < nodes.size(); i++) {
			this.adjust_node(nodes[i]);
		}
	},
	
	set_new_bounds: function(){
		//adjust all immediate child nodes(grand-children are adjusted recursively)
		nodes = this.facade.getCanvas().getChildNodes();
		for (var i = 0; i < nodes.size(); i++) {
			this.adjust_node(nodes[i]);
			//alert("calling changed");
			nodes[i]._changed();// mark node as changed
			//alert("calling update");
			//nodes[i].update();	//should trigger a redraw in all child nodes
		}
		this.facade.getCanvas().update();
	},
	
	automatic_layout: function() {
		Ext.Msg.confirm(ORYX.I18N.Oryx.title, "It is recommended to save the current model before running the automatic layouting, since it may produce unwanted results!\nStart layouting?",
						this._automatic_layout, this);	
	},

	force_automatic_layout: function() {
		this._automatic_layout("yes");
	},	
	
	_automatic_layout: function(proceed) {
		if (proceed != "yes")
		{
			return;
		}
		this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text: 'Auto Layouting'});
		

		try {
		 	var serialized_rdf = this.getRDFFromDOM();
			serialized_rdf = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serialized_rdf;
			
			//call server layout function			new Ajax.Request(ORYX.CONFIG.AUTO_LAYOUTER_URL, {
	            method: 'POST',
	            parameters: {
	                "rdf": serialized_rdf
	            },
	            onSuccess: function(request){
					//alert("Returned: " + request.responseText);
					this.returned_layout = eval('(' + request.responseText + ')');
					if (!this.returned_layout.error) {
						this.set_new_bounds();
					}
					else {
						Ext.Msg.alert(ORYX.I18N.Oryx.title, "An error occurred in the server:\n" + this.returned_layout.error);
					}
					this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
				}.bind(this),
				onFailure: function(request){
					this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
					Ext.Msg.alert(ORYX.I18N.Oryx.title, "Request to server failed!");
				}.bind(this)
	        });
		} catch (error){
			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
			Ext.Msg.alert(ORYX.I18N.Oryx.title, "Layouting failed.", error);
	 	}
	},
	
});
