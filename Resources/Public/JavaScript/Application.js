T3X = {};
T3X.ExtbaseKickstarter = {};

Ext.ns('T3X.ExtbaseKickstarter');


/**
 * @class T3X.ExtbaseKickstarter.Application
 * @namespace T3X.ExtbaseKickstarter
 * @extends Ext.util.Observable
 * 
 * The main entry point which controls the lifecycle of the application.
 *
 * This is the main event handler of the application.
 *
 * First, it calls all registered bootstrappers, thus other modules can register
 * event listeners. Afterwards, the bootstrap procedure is started. During
 * bootstrap, it will initialize:
 * <ul>
 * <li>QuickTips</li>
 * <li>History Manager</li>
 * </ul>
 *
 * @singleton
 */
T3X.ExtbaseKickstarter.Application = Ext.apply(new Ext.util.Observable, {
	/**
	 * @event T3X.ExtbaseKickstarter.Application.afterBootstrap After bootstrap event. Should
	 * be used for main initialization.
	 */

	/**
	 * List of all bootstrap objects which have been registered
	 * @private
	 */
	bootstrappers: [],

	/**
	 * Main bootstrap. This is called by Ext.onReady and calls all registered
	 * bootstraps.
	 *
	 * This method is called automatically.
	 */
	bootstrap: function() {
		console.log('T3X.ExtbaseKickstarter.Application.bootstrap');

		this._initializeConfiguration();
		this._invokeBootstrappers();
		Ext.QuickTips.init();

		this.fireEvent('T3X.ExtbaseKickstarter.Application.afterBootstrap');
	},

	/**
	 * Registers a new bootstrap class.
	 *
	 * Every bootstrap class needs to extend
	 * T3X.ExtbaseKickstarter.Application.AbstractBootstrap.
	 *
	 * @param {T3X.ExtbaseKickstarter.Application.AbstractBootstrap} bootstrap The bootstrap
	 * class to be registered.
	 * @api
	 */
	registerBootstrap: function(bootstrap) {
		this.bootstrappers.push(bootstrap);
	},
	
	/**
	 * Initialize the configuration object in T3X.ExtbaseKickstarter.Configuration
	 * @private
	 */
	_initializeConfiguration: function() {
		/*var baseTag = Ext.query('base')[0];
		if (typeof baseTag.href == 'string') {
			T3X.ExtbaseKickstarter.Configuration.Application.frontendBaseUri = baseTag.href;
		} else {
			T3X.ExtbaseKickstarter.Configuration.Application.frontendBaseUri = '/';
			if (window.console) {
				console.warn("Base URI could not be extracted");
			}
		}
		T3X.ExtbaseKickstarter.Configuration.Application.backendBaseUri = T3X.ExtbaseKickstarter.Configuration.Application.frontendBaseUri + 'typo3/';*/
	},

	/**
	 * Invoke the registered bootstrappers.
	 * @private
	 */
	_invokeBootstrappers: function() {
		Ext.each(
			this.bootstrappers,
			function(bootstrapper) {
				bootstrapper.initialize();
			}
		);
	}
});

Ext.onReady(T3X.ExtbaseKickstarter.Application.bootstrap, T3X.ExtbaseKickstarter.Application);
