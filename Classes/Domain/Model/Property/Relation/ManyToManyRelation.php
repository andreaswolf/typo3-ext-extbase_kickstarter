<?php
/***************************************************************
*  Copyright notice
*
*  (c) 2009 Ingmar Schlecht
*  All rights reserved
*
*  This script is part of the TYPO3 project. The TYPO3 project is
*  free software; you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation; either version 2 of the License, or
*  (at your option) any later version.
*
*  The GNU General Public License can be found at
*  http://www.gnu.org/copyleft/gpl.html.
*
*  This script is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  This copyright notice MUST APPEAR in all copies of the script!
***************************************************************/

/**
 * Creates a request an dispatches it to the controller which was specified
 * by TS Setup, Flexform and returns the content to the v4 framework.
 *
 * This class is the main entry point for extbase extensions in the frontend.
 *
 * @package ExtbaseKickstarter
 * @version $ID:$
 */
class Tx_ExtbaseKickstarter_Domain_Model_Property_Relation_ManyToManyRelation extends Tx_ExtbaseKickstarter_Domain_Model_Property_Relation_AnyToManyRelation {

	/**
	 * Returns the type for an ObjectStorage and its contained type based on a mm-relation.
	 *
	 * @return string The type.
	 */
	public function getTypeForComment() {
		return 'Tx_Extbase_Persistence_ObjectStorage<' . $this->getForeignClass()->getClassName() . '>';
	}

	/**
	 * returns the type hint to be used in the arguments list of the method.
	 *
	 * @return string The type hint.
	 */
	public function getTypeHint() {
		return 'Tx_Extbase_Persistence_ObjectStorage';
	}

	/**
	 * Returns the relation table name. It is build by having 'tx_myextension_' followed by the 
	 * first domain object name followed by the second domain object name followed by '_mm'.
	 *
	 * @return void
	 */
	public function getRelationTableName() {
		return 'tx_'
			. strtolower(Tx_Extbase_Utility_Extension::convertLowerUnderscoreToUpperCamelCase($this->domainObject->getExtension()->getExtensionKey()))
			. '_'
			. strtolower($this->domainObject->getName())
			. '_'
			. strtolower($this->foreignClass->getName())
			. '_mm';
	}
	
}
?>