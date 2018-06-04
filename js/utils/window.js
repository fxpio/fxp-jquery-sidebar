/*
 * This file is part of the Fxp package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {isOverMinWidth, changeTransition} from "./css";
import {lockBodyScroll, unlockBodyScroll} from "./scrollbar";

/**
 * Close the sidebar or reopen the locked sidebar on window resize event.
 *
 * @param {Event} event The event
 *
 * @typedef {Sidebar} Event.data The sidebar instance
 */
export function onResizeWindow(event) {
    let self = event.data,
        isForceOpened = false,
        isOver = isOverMinWidth(self);

    changeTransition(self.$element, 'none');

    if (isOver && self.isLocked()) {
        self.forceOpen();
        unlockBodyScroll(self);
        isForceOpened = true;
    }

    if (undefined === self.resizeDelay) {
        self.resizeDelay = window.setTimeout(function () {
            delete self.resizeDelay;
            changeTransition(self.$element, '');

            if (!isForceOpened && self.isLocked()) {
                if (!isOver && self.isOpen()) {
                    lockBodyScroll(self);
                } else {
                    unlockBodyScroll(self);
                }
            }
        }, 500);
    }
}
