Ext.ns("T3X.ExtbaseKickstarter.UserInterface");

T3X.ExtbaseKickstarter.UserInterface.Layout = Ext.extend(Ext.Viewport, {
	initComponent: function() {
		console.log('T3X.ExtbaseKickstarter.UserInterface.Layout.initComponent');
		/*var config = {
			layout: 'vbox',
			layoutConfig: {
				align: 'stretch'
			},
			items: [{
				//xtype: 'T3X.ExtbaseKickstarter.UserInterface.TopBar',
				xtype: 'panel',
				ref: 'topBar',
				flex: 1
			}, {
				//xtype: 'T3X.ExtbaseKickstarter.UserInterface.SectionMenu',
				xtype: 'toolbar',
				ref: 'sectionMenu',
				flex: 0
			}],
			renderTo: Ext.getBody()
		};*/
		var contentPanel = {
			xtype: 'tabpanel',
			id: 'content-panel',
			region: 'center', // this is what makes this panel into a region within the containing layout
			deferredRender: false,
            activeTab: 0,     // first tab initially active
            items: [{
                title: 'General information',
                id: 'tab-general',
                html: '<p>Info about the plugin goes here.</p>',
                autoScroll: true
            }, {
                title: 'Domain Modeling',
                id: 'tab-dm',
                layout: 'fit',
                padding: 0
            }, {
                title: 'Backend Modules',
                id: 'tab-be',
                html: '<p>Create backend plugins here.</p>',
                autoScroll: true
            }, {
                title: 'Frontend Plugins',
                id: 'tab-fe',
                html: '<p>Create frontend plugins here.</p>',
                autoScroll: true
            }]
		};

		var config = {
			layout: 'border',
			title: 'Extbase Kickstarter',
			items: [
				{
					xtype: 'box',
					region: 'north',
	                height: 22, // give north and south regions a height
	                contentEl: 'typo3-docheader-row1'
				},
				contentPanel
			],
			renderTo: Ext.getBody()
		}

		Ext.apply(this, config);
		T3X.ExtbaseKickstarter.UserInterface.Layout.superclass.initComponent.call(this);
		this.doLayout();
		//T3X.ExtbaseKickstarter.UserInterface.Layout.render('typo3-docbody');
	}
});