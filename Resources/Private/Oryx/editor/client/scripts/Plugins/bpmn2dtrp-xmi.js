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
ORYX.Plugins.BPMN2DTRPXMI = ORYX.Plugins.AbstractPlugin.extend({
	
	stencilSetExtensionSuffix: '/bpmn-design-thinking-subset#',

	construct: function() {

		arguments.callee.$.construct.apply(this, arguments);
	
		this.facade.offer({
			'name'				: ORYX.I18N.BPMN2DTRPXMI.DTRPXMIExport,
			'functionality'		: this.transform.bind(this),
			'group'				: ORYX.I18N.BPMN2DTRPXMI.group,
            dropDownGroupIcon   : ORYX.PATH + "images/export2.png",
			'icon'				: ORYX.PATH + "images/page_white_code_red.png",
			'description'		: ORYX.I18N.BPMN2DTRPXMI.DTRPXMIExportDescription,
			'index'				: 1,
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

	transform: function() {		

		var xslt		= ORYX.PATH + "xslt/BPMN2DTRP-XMI.xslt"; 
		var transformed = this.doTransform( this.getRDFFromDOM(), xslt );
		//var transformed = this.getRDFFromDOM();
		
		this.openDownloadWindow( window.document.title + ".xmi", transformed );
		
	}
	
});
