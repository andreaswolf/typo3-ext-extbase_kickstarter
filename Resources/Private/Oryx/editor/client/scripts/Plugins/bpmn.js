/**
 * Copyright (c) 2008-2009
 * Sven Wagner-Boysen, Willi Tscheschner
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

ORYX.Plugins.BPMN = {

	/**
	 *	Constructor
	 *	@param {Object} Facade: The Facade of the Editor
	 */
	construct: function(facade) {
		this.facade = facade;
		this.facade.registerOnEvent('layout.bpmn.pool', this.handleLayoutBPMNPool.bind(this));
		
		//this.facade.registerOnEvent('layout.bpmn11.lane', this.handleLayoutLane.bind(this));
	},
	handleLayoutBPMNPool: function(event){
		
		var shape = event.shape;	
		var lanes = shape.getChildNodes(false).findAll(function(node) {
			return (node.getStencil().id() === "http://b3mn.org/stencilset/bpmn#Lane");
		});
		
		if(lanes.length > 0) {
		
			lanes = lanes.sortBy(function(lane) {
				return lane.bounds.upperLeft().y;
			});
			
			var shapeWidth = shape.bounds.width();
			var shapeHeight = 0;
			var topBound = 0;
			lanes.each(function(lane) {
				var ul = lane.bounds.upperLeft();
				var lr = lane.bounds.lowerRight();
				ul.y = shapeHeight;
				lr.y = ul.y + lane.bounds.height();
				shapeHeight += lane.bounds.height();
				ul.x = 30;
				lr.x = shapeWidth;
				lane.bounds.set(ul, lr);
			});
			
			var upl = shape.bounds.upperLeft();
			shape.bounds.set(upl.x, upl.y, shape.bounds.lowerRight().x, upl.y + shapeHeight);
		}
		}
};

ORYX.Plugins.BPMN = ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.BPMN);
