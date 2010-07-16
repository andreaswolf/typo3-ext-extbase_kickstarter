<?php

class Tx_ExtbaseKickstarter_ViewHelpers_Be_ConfigurationViewHelper extends Tx_Fluid_ViewHelpers_Be_AbstractBackendViewHelper {
	public function render() {
		$doc = $this->getDocInstance();

		/** @var t3lib_pageRenderer $pageRenderer */
		$pageRenderer = $doc->getPageRenderer();
		$pageRenderer->enableDebugMode();

		$pageRenderer->enableExtJsDebug();
		$pageRenderer->loadExtJS();

		// SECTION: JAVASCRIPT FILES
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/Application.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/Application/AbstractBootstrap.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/UserInterface/Bootstrap.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/UserInterface/Layout.js');

		// Oryx libraries
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/Editor/path_parser.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/Editor/translation_en_us.js');
		$pageRenderer->addJsFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/JavaScript/Editor/oryx.debug.js');

		// SECTION: CSS Files
		// Oryx CSS stuff
		$pageRenderer->addCssFile(t3lib_extMgm::extRelPath('extbase_kickstarter') . '/Resources/Public/CSS/oryx_theme_norm.css');
	}
}

?>