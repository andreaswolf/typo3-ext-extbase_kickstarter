<?php
/*                                                                        *
 * This script belongs to the FLOW3 package "ExtbaseKickstarter".         *
 *                                                                        *
 * It is free software; you can redistribute it and/or modify it under    *
 * the terms of the GNU Lesser General Public License as published by the *
 * Free Software Foundation, either version 3 of the License, or (at your *
 * option) any later version.                                             *
 *                                                                        *
 * This script is distributed in the hope that it will be useful, but     *
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHAN-    *
 * TABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser       *
 * General Public License for more details.                               *
 *                                                                        *
 * You should have received a copy of the GNU Lesser General Public       *
 * License along with the script.                                         *
 * If not, see http://www.gnu.org/licenses/lgpl.html                      *
 *                                                                        *
 * The TYPO3 project - inspiring people to share!                         *
 *                                                                        */

/**
 * View helper which returns a quoted string
 *
 * = Examples =
 *
 * <f:addSlashes>{anyString}</f:addSlashes>
 *
 *
 * @package	 ExtbaseKickstarter
 * @author	 Rens Admiraal
 * @version $ID:$
 * @license http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public License, version 3 or later
 */
class Tx_ExtbaseKickstarter_ViewHelpers_QuoteStringViewHelper extends Tx_Fluid_Core_ViewHelper_AbstractViewHelper {

	/**
	 * @param string $value
	 */
	public function render($value = null) {
		if ($value == null) {
			$value = $this->renderChildren();
		}
		
		return addslashes($value);
	}
}