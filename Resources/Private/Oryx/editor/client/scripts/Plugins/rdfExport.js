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
ORYX.Plugins.RDFExport = ORYX.Plugins.AbstractPlugin.extend({
	
	construct: function() {

		arguments.callee.$.construct.apply(this, arguments);
	
		this.facade.offer({
			'name'				: ORYX.I18N.RDFExport.rdfExport,
			'functionality'		: this.exportRDF.bind(this),
			'group'				: ORYX.I18N.RDFExport.group,
            dropDownGroupIcon   : ORYX.PATH + "images/export2.png",
			'icon'				: ORYX.PATH + "images/page_white_code.png",
			'description'		: ORYX.I18N.RDFExport.rdfExportDescription,
			'index'				: 0,
			'minShape'			: 0,
			'maxShape'			: 0
		});
		
	},

	exportRDF: function() {		

		this.openDownloadWindow( window.document.title + ".rdf", this.getRDFFromDOM() );
		
	}
	
});


