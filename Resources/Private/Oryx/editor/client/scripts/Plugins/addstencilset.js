/**
 * Copyright (c) 2006
 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner
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

//No I18N, because not in use!!!

//TODO this one fails when importing a stencilset that is already loaded. Hoewver, since an asynchronous callback throws the error, the user doesn#t recognize it.
ORYX.Plugins.AddStencilSet = {

	/**
	 *	Constructor
	 *	@param {Object} Facade: The Facade of the Editor
	 */
	construct: function(facade) {
		this.facade = facade;

		this.facade.offer({
			'name':"Add Stencil Set",
			'functionality': this.addStencilSet.bind(this),
			'group': "StencilSet",
			'icon': ORYX.PATH + "images/add.png",
			'description': "Add a stencil set.",
			'index': 1,
			'minShape': 0,
			'maxShape': 0});
	},
	
	addStencilSet: function() {
		var url = Ext.Msg.prompt(ORYX.I18N.Oryx.title, "Enter relative url of the stencil set's JSON file:", (function(btn, url) {
			if(btn == 'ok' && url) {
				this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE, text:"Loading Stencil Set"});
				
				window.setTimeout(function(){
					
					this.facade.loadStencilSet(url);
					this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
				
				}.bind(this), 100);
			}		}).bind(this));	
	}
};
ORYX.Plugins.AddStencilSet = Clazz.extend(ORYX.Plugins.AddStencilSet);
