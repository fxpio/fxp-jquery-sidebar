/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {isOverMinWidth} from "./css";

/**
 * Binding actions of keyboard.
 *
 * @param {jQuery.Event|Event} event
 */
export function keyboardAction(event) {
    if (!(event instanceof jQuery.Event)) {
        return;
    }

    if (event.data.options.disabledKeyboard) {
        return;
    }

    let self = event.data,
        kbe = self.options.keyboardEvent;

    if (event.shiftKey === kbe.shiftKey &&
        event.ctrlKey  === kbe.ctrlKey &&
        event.altKey   === kbe.altKey &&
        event.keyCode  === kbe.keyCode) {
        self.toggle(event);
    }
}

/**
 * Close the sidebar since external action.
 *
 * @param {Event} event The event
 *
 * @typedef {Sidebar} Event.data The sidebar instance
 */
export function closeExternal(event) {
    let self = event.data;

    event.stopPropagation();
    event.preventDefault();

    if (isOverMinWidth(self)) {
        self.close();

    } else {
        self.forceClose();
    }
}

/**
 * Close the sidebar when an item is selected.
 *
 * @param {Event} event The event
 *
 * @typedef {Sidebar} Event.data The sidebar instance
 */
export function closeOnSelect(event) {
    let self = event.data;

    if (self.options.closeOnSelectDelay > 0) {
        self.closeDelay = window.setTimeout(function () {
            self.close();
        }, self.options.closeOnSelectDelay * 1000);
    } else {
        self.close();
    }
}

/**
 * Clean the close delay.
 *
 * @param {Sidebar} self The sidebar instance
 */
export function cleanCloseDelay(self) {
    if (null !== self.closeDelay) {
        window.clearTimeout(self.closeDelay);
        self.closeDelay = null;
    }
}
