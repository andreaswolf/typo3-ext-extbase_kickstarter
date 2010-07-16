<?php

class Tx_ExtbaseKickstarter_ViewHelpers_Be_ConfigurationViewHelper extends Tx_Fluid_ViewHelpers_Be_AbstractBackendViewHelper {
	public function render() {
		$doc = $this->getDocInstance();
		$doc->bodyTagAdditions .= 'class="yui-skin-sam"';

		/** @var t3lib_pageRenderer $pageRenderer */
		$pageRenderer = $doc->getPageRenderer();
		$pageRenderer->enableDebugMode();

		$pageRenderer->enableExtJsDebug();
		$pageRenderer->loadExtJS();

		// SECTION: JAVASCRIPT FILES
		// YUI Basis Files
		/*$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/yui/utilities/utilities.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/yui/resize/resize-min.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/yui/layout/layout-min.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/yui/container/container-min.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/yui/json/json-min.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/yui/button/button-min.js');

		// YUI-RPC
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/yui-rpc.js');

		// InputEx with wirable options
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/inputex.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/Field.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/util/inputex/WirableField-beta.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/Group.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/Visus.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/fields/StringField.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/fields/Textarea.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/fields/SelectField.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/fields/EmailField.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/fields/UrlField.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/fields/ListField.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/fields/CheckBox.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/fields/InPlaceEdit.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/fields/MenuField.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/js/fields/TypeField.js');

		// WireIt
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/excanvas.js', 'text/javascript', TRUE, FALSE, '<!--[if IE]>|<![endif]-->');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/WireIt.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/CanvasElement.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/Wire.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/Terminal.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/util/DD.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/util/DDResize.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/Container.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/ImageContainer.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/Layer.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/util/inputex/FormContainer-beta.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/LayerMap.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/js/WiringEditor.js');

		// Extbase Modelling definition
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/extbaseModeling.js');*/

		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/Application.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/Application/AbstractBootstrap.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/UserInterface/Bootstrap.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/UserInterface/Layout.js');

		// Oryx libraries
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/Editor/path_parser.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/Editor/translation_en_us.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/Editor/oryx.debug.js');

		// Oryx CSS stuff
		$pageRenderer->addCssFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/CSS/oryx_theme_norm.css');

		// SECTION: CSS Files
		// YUI CSS
		/*$pageRenderer->addCssFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/yui/reset-fonts-grids/reset-fonts-grids.css');
		$pageRenderer->addCssFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/yui/assets/skins/sam/skin.css');

		// InputEx CSS
		$pageRenderer->addCssFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/lib/inputex/css/inputEx.css');

		// WireIt CSS
		$pageRenderer->addCssFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/css/WireIt.css');
		$pageRenderer->addCssFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/wireit/css/WireItEditor.css');

		// Custom CSS
		$pageRenderer->addCssFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/jsDomainModeling/extbaseModeling.css');*/

	}
}

?>