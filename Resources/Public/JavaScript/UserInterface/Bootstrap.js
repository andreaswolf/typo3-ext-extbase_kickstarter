Ext.ns("T3X.ExtbaseKickstarter.UserInterface");

T3X.ExtbaseKickstarter.UserInterface.Bootstrap = Ext.apply(new T3X.ExtbaseKickstarter.Application.AbstractBootstrap, {
	initialize: function() {
		T3X.ExtbaseKickstarter.Application.on('T3X.ExtbaseKickstarter.Application.afterBootstrap', this._initViewport, this);
		console.log('T3X.ExtbaseKickstarter.UserInterface.Bootstrap.initialize');
	},

	/**
	 * Create the main viewport for layouting all components in a full
	 * width and height browser window.
	 */
	_initViewport: function() {
		console.log('T3X.ExtbaseKickstarter.UserInterface.Bootstrap._initViewport');
		T3X.ExtbaseKickstarter.UserInterface.viewport = new T3X.ExtbaseKickstarter.UserInterface.Layout();
		T3X.ExtbaseKickstarter.Application.fireEvent('T3X.ExtbaseKickstarter.UserInterface.afterInitialize');
	}
});
T3X.ExtbaseKickstarter.Application.registerBootstrap(T3X.ExtbaseKickstarter.UserInterface.Bootstrap);
