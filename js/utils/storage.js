/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {changeTransition} from "./css";

/**
 * Set the value in local storage.
 *
 * @param {Sidebar}        self  The sidebar instance
 * @param {String}         key   The key
 * @param {String|Boolean} value The value
 */
export function setLocalStorage(self, key, value) {
    if (self.options.saveConfig && 'localStorage' in window) {
        try {
            window.localStorage.setItem(self.$element.prop('id') + '/' + key, value);
        } catch (e) {}
    }
}

/**
 * Get the value in local storage.
 *
 * @param {Sidebar}        self           The sidebar instance
 * @param {String}         key            The key
 * @param {String|Boolean} [defaultValue] The default value
 *
 * @return {String|null}
 */
export function getLocalStorage(self, key, defaultValue) {
    let value = undefined === defaultValue ? null : defaultValue,
        itemValue = null;

    if (self.options.saveConfig && 'localStorage' in window) {
        itemValue = window.localStorage.getItem(self.$element.prop('id') + '/' + key);
    }

    return null !== itemValue ? itemValue : value;
}

/**
 * Init the sidebar options with the locale storage.
 *
 * @param {Sidebar} self The sidebar instance
 */
export function initWithLocalStorage(self) {
    let storageLocked = getLocalStorage(self, self.options.storageLockedKey);

    if (null !== storageLocked && self.options.toggleOnClick) {
        self.options.locked = storageLocked === 'true';

        if (!self.options.locked) {
            changeTransition(self.$element, 'none');
            self.forceClose();
        }
    }
}
