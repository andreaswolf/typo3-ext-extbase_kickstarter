/**
 * Copyright (c) 2008
 * Jan-Felix Schwarz
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

ORYX.Plugins.RowLayouting = {

	/**
	 *	Constructor
	 *	@param {Object} Facade: The Facade of the Editor
	 */
	construct: function(facade) {
		this.facade = facade;
		// Initialize variables
		
		this.currentShapes = [];			// Current selected Shapes
		this.toMoveShapes = [];				// Shapes that are moved
	
		this.dragBounds = undefined;
		this.offSetPosition = {x:0, y:0};
		this.evCoord = {x:0, y:0};

		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LAYOUT_ROWS, this.handleLayoutRows.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));
	},
	
	
	/**
	 * On the Selection-Changed
	 *
	 */
	onSelectionChanged: function(event) {
		
		var elements = event.elements;

		// If there are no elements
		if(!elements || elements.length == 0) {
			// reset all variables
			this.currentShapes = [];
			this.toMoveShapes = [];
			this.dragBounds = undefined;
		} else {

			// Set the current Shapes
			this.currentShapes = elements;

			// Get all shapes with the highest parent in object hierarchy (canvas is the top most parent)
			this.toMoveShapes = this.facade.getCanvas().getShapesWithSharedParent(elements);
			
			this.toMoveShapes = this.toMoveShapes.findAll( function(shape) { return shape instanceof ORYX.Core.Node && 
																			(shape.dockers.length === 0 || !elements.member(shape.dockers.first().getDockedShape()))});		
		
			// Calculate the area-bounds of the selection
			var newBounds = undefined;
			elements.each(function(value) {
				if(!newBounds)
					newBounds = value.absoluteBounds();
				else
					newBounds.include(value.absoluteBounds());
			});

			// Set the new bounds
			this.dragBounds = newBounds;

		}
		
		/*if(!this.dragBounds) {return};
		
		
		var ul = this.dragBounds.upperLeft();
		
		var offSetPosition = {
			x: this.evCoord.x - ul.x,
			y: this.evCoord.y - ul.y
		}
		
		this.toMoveShapes.each(function(shape) {
			shape.bounds.moveBy(offSetPosition);
		});*/
		
		return;
	},
	
	handleMouseDown: function(event, uiObj) {
		if(!this.dragBounds || !this.toMoveShapes.member(uiObj)) {return};
		
		var evCoord 	= this.facade.eventCoordinates( event );
		var ul = this.dragBounds.upperLeft();
		
		this.offSetPosition = {
			x: evCoord.x - ul.x,
			y: evCoord.y - ul.y
		}
		
		return;
	},	
	
	/**
	 * On Layout Rows
	 *
	 */
	handleLayoutRows: function(event) {
		var shape = event.shape;
		
		var offsetPos = this.offSetPosition;
		
		var marginLeft = event.marginLeft;
		var marginTop = event.marginTop;
		var spacingX = event.spacingX;
		var spacingY = event.spacingY;
		var elements = event.shape.getChildShapes(false);
		
		var movedShapes = this.toMoveShapes;
		movedShapes.each(function(shape){
			if(elements.include(shape)) shape.bounds.moveBy(offsetPos);
		});
		
		// exclude specified stencils from layouting
		if (event.exclude) {
			elements = elements.filter(function(element){
				return !event.exclude.some(function(value){
					return element.getStencil().id() == value;
				});
			});
		}
		
		var rowTop = marginTop;
		var rowBottom = marginTop - spacingY;
		
		if (event.horizontalLayout) {
			// in case of horizontal layout: reset Y values
			elements.each(function(element){
				var ul = element.bounds.upperLeft();
				element.bounds.moveTo(ul.x, rowTop);
			})
		}
		else 
			if (event.verticalLayout) {
				// in case of vertical layout: reset X values
				elements.each(function(element){
					var ul = element.bounds.upperLeft();
					element.bounds.moveTo(marginLeft, ul.y);
				})
			}
		
		// Sort top-down
		elements = elements.sortBy(function(element){
			return element.bounds.upperLeft().y;
		});
		
		var insertRowOffset = 0;
		var deleteRowOffset = 0;
		var isNewRow = false;
		
		// Assign shapes to rows
		elements.each(function(element){
		
			var ul = element.bounds.upperLeft();
			var lr = element.bounds.lowerRight();
			
			// save old values
			var oldUlX = ul.x;
			var oldUlY = ul.y;
			var oldLrX = lr.x;
			var oldLrY = lr.y;
			
			if (movedShapes.include(element)) {
				ul.y -= deleteRowOffset;
				
				if ((ul.y > rowBottom) || ((element == elements.first()) && ul.y < marginTop)) {
					// ul.y < marginTop wird bei nebeneinander nach oben verschobenen shapes
					// mehrmals erfüllt, dadurch mehrmals neue row und untereinanderrutschen
					// -> nur falls erstes element
					
					// next row
					isNewRow = false;
					rowTop = rowBottom + spacingY;
					if (ul.y < rowTop) {
						// insert new row
						//insertRowOffset += element.bounds.height() + 1;
						isNewRow = true;
					}
				}
			}
			else {
				ul.y += insertRowOffset;
				ul.y -= deleteRowOffset;
				
				if (ul.y > rowTop) {
					// next row
					isNewRow = false;
					rowTop = rowBottom + spacingY;
				}
			}
			
			// align shape at row top
			ul.y = rowTop;
			lr.y = ul.y + element.bounds.height();
			
			if (lr.y > rowBottom) {
				// extend row height and inserted rows offset
				// following lines don't work as required
				if (isNewRow) 
					insertRowOffset += lr.y - rowBottom;
				else 
					if (movedShapes.include(element)) 
						insertRowOffset += lr.y - rowBottom;
				rowBottom = lr.y;
			}
			
			if ((ul.x != oldUlX) || (ul.y != oldUlY) || (lr.x != oldLrX) || (lr.y != oldLrY)) {
				// only set bounds if ul or lr updated
				if (!movedShapes.include(element)) {
					// if non-moved elements are repositioned upwards also move following [moved] elements upwards
					// (otherwise dropping the moved element to a row below wouldn't work correctly)
					if ((oldUlY - ul.y) > deleteRowOffset) 
						deleteRowOffset = oldUlY - ul.y;
				}
				element.bounds.set(ul.x, ul.y, lr.x, lr.y);
			}
		});
		
		// Sort top-down from left to right
		elements = elements.sortBy(function(element){
			return element.bounds.upperLeft().y * 10000 + element.bounds.upperLeft().x;
		});
		
		rowTop = marginTop;
		var rowRight = marginLeft - spacingX;
		var maxRowRight = rowRight;
		var maxRowBottom = 0;
		
		// Arrange shapes on rows (align left)
		elements.each(function(element){
		
			var ul = element.bounds.upperLeft();
			var lr = element.bounds.lowerRight();
			
			// save old values
			var oldUlX = ul.x;
			var oldUlY = ul.y;
			var oldLrX = lr.x;
			var oldLrY = lr.y;
			
			if (ul.y > rowTop) {
				// next row
				rowTop = ul.y;
				rowRight = marginLeft - spacingX;
			}
			
			// align at right border of the row
			ul.x = rowRight + spacingX;
			lr.x = ul.x + element.bounds.width();
			rowRight = lr.x;
			
			if (rowRight > maxRowRight) 
				maxRowRight = rowRight;
			if (lr.y > maxRowBottom) 
				maxRowBottom = lr.y;
			
			if ((ul.x != oldUlX) || (ul.y != oldUlY) || (lr.x != oldLrX) || (lr.y != oldLrY)) {
				// only set bounds if ul or lr updated
				element.bounds.set(ul.x, ul.y, lr.x, lr.y);
			}
			
		});
		
		if (event.shape != this.facade.getCanvas()) {
			// adjust parents bounds
			var ul = event.shape.bounds.upperLeft();
			if (maxRowRight > marginLeft) 
				event.shape.bounds.set(ul.x, ul.y, ul.x + maxRowRight + marginLeft, ul.y + rowBottom + marginTop);
		}
		else {
			// extend canvas size if necessary
			if (maxRowRight > this.facade.getCanvas().bounds.width()) {
				this.facade.getCanvas().setSize({
					width: (maxRowRight + marginLeft),
					height: this.facade.getCanvas().bounds.height()
				});
			}
			if (maxRowBottom > this.facade.getCanvas().bounds.height()) {
				this.facade.getCanvas().setSize({
					width: this.facade.getCanvas().bounds.width(),
					height: (rowBottom + marginTop)
				});
			}
		}
		
		
		return;
	}};

ORYX.Plugins.RowLayouting = Clazz.extend(ORYX.Plugins.RowLayouting);
